// ==UserScript==
// @name        Day pass poller
// @description Day pass poller
// @namespace   tuff
// @include     https://*.discovercamping.ca/BCCWeb/Memberships/MembershipPasses.aspx
// @include     https://discovercamping.ca/BCCWeb/Memberships/MembershipPasses.aspx
// @grant       none
// @version     0.2
// ==/UserScript==

const DEFAULT_QUANTITY = 2;
const POLL_DELAY = 200;
const DEFAULT_OPTION_SEARCH =
  localStorage.__tuff_DEFAULT_OPTION_SEARCH || 'Rubble Creek Trailhead';

const POLL_LEAD_MS = 5 * 1000;
const LOGIN_DURATION_MS = 1000 * 60 * 14;

const SIX_AM_MS = (() => {
  const date = new Date();
  
  date.setHours(6);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);

  return date.getTime();
})();

const __tuff_CSS = `
  body.tuff {
    padding-bottom: 600px;
  }

  .tuff-wrapper {
    padding: 10px;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #76d29e;
    display: flex;
    justify-content: space-around;
  }

  .tuff-wrapper button {
    font-weight: bold;
    font-size: 24px;
    background: yellow;
  }
`;

let __serverTimeMs;
let __tuff_data = {};

async function __tuff_pollForPasses(args) {
  const { membershipId, qty, passType = 2, placeId } = args;
  const diff = __serverTimeMs - SIX_AM_MS;
  const shouldRequest = diff > -POLL_LEAD_MS;
  const serverDate = new Date(__serverTimeMs);

  document.querySelector('.js-tuff-poll-count').textContent = args._tries + 
    (shouldRequest ? '' : '*');

  if (shouldRequest) {
    console.log('Requesting', diff, serverDate);

    $.ajax({
      type: 'POST',
      url: 'MembershipPasses.aspx/MembershipAddToCart',
      data: JSON.stringify({
        data: {
          membershipId,
          qty,
          passType,
          placeId,
        },
      }),
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      success: response => __tuff_onPollSuccess(response, args),
      error: () => alert('error'),
      failure: () => alert('failure'),
    });
    
    return;
  }

  const wait = Math.min(POLL_LEAD_MS, Math.abs(diff));

  console.log('Waiting to request', diff, serverDate);
  await new Promise(res => setTimeout(res, wait));
  __tuff_pollForPasses({ ...args, _tries: args._tries + 1 });
}

async function __tuff_onPollSuccess(response, pollArgs) {
  if (response.d.Status == '1') {
    alert(`⭐ SUCCESS ⭐`);

    window.location.pathname = '/BCCWeb/Customers/ShoppingCart.aspx';
    return;
  }

  console.log(`ℹ️ POLL ${pollArgs._tries}`, response, pollArgs);

  if (response.d.Status == '-1') {
    await new Promise(res => setTimeout(res, POLL_DELAY));

    __tuff_pollForPasses({
      ...pollArgs,
      _tries: pollArgs._tries + 1,
    });
  } else {
    alert(`💩 SOLD OUT 💩`);

    $('#messageBoxLightbox2').css('z-index', 1300);
    $('#messageBoxLightbox2 .modal-body').html(
      'The maximum number of ' +
      response.d.Msg +
      ' Permits have been issued for today.  Please consider a future date to visit the park.'
    );
    $('#messageBoxLightbox2 .modal-title').html('Information');
    $('#messageBoxLightbox2').modal();
  }
}

function __tuff_scrapePassData() {
  const titleDivs = [...document.querySelectorAll('[id^="tit_"][class^="bg_tit_card_"]')];
  const data = titleDivs.map(div => {
    const parent = div.closest('.faq_main_box_div');
    const title = div.textContent.trim();
    const membershipId = div.id.replace('tit_', '');
    const qtyInput = parent.querySelector('.passQty');
    const cartLink = parent.querySelector('.add_cart_card > a');
    const passType = Boolean(qtyInput) ? 2 : 1;
    const placeParent = parent.closest('.card .collapse');
    const placeId = placeParent.id.replace('collapse_', '');

    return {
      title,
      available: Boolean(cartLink),
      membershipId,
      passType,
      placeId,
    };
  });

  return data;
}

function __tuff_addUi() {
  const needsLogin = Boolean(document.querySelector('#aLogin'));

  if (needsLogin) {
    window.OpenLoginPopup(window.location.href);
    return;
  }

  const data = __tuff_scrapePassData();
  const wrapper = document.createElement('div');
  const timeDiv = document.createElement('div');
  const style = document.createElement('style');
  const select = document.createElement('select');
  const quantityInput = document.createElement('input');
  const pollButton = document.createElement('button');

  __tuff_data = data.reduce((acc, item) => ({
    ...acc,
    [item.title]: item,
  }), {});

  const options = data.map(item => {
    const option = document.createElement('option');

    option.textContent = item.title;
    option.disabled = !item.available;

    return option;
  });

  options.forEach(option => {
    select.appendChild(option);

    if (!option.disabled && option.textContent.includes(DEFAULT_OPTION_SEARCH)) {
      option.selected = true;
    }
  });
  wrapper.appendChild(select);

  style.textContent = __tuff_CSS;

  document.head.appendChild(style);
  document.body.classList.add('tuff');
  wrapper.classList.add('tuff-wrapper');

  quantityInput.type = 'number';
  quantityInput.value = DEFAULT_QUANTITY;
  quantityInput.setAttribute('max', 8);
  quantityInput.setAttribute('min', 1);
  wrapper.appendChild(quantityInput);

  timeDiv.classList.add('js-tuff-server-time');
  wrapper.appendChild(timeDiv);

  pollButton.classList.add('js-tuff-poll-button');
  pollButton.disabled = true;
  pollButton.type = 'button';
  pollButton.innerHTML = `🧵 POLL <span class="js-tuff-poll-count"></span>`;
  pollButton.addEventListener('click', __tuff_onClickPollButton);
  wrapper.appendChild(pollButton);

  document.body.appendChild(wrapper);

  __tuff_updateServerTime();
};

async function __tuff_updateServerTime() {
  const start = Date.now();
  const response = await fetch('', { method: 'HEAD' });
  const responseTime = Date.now() - start;
  const dateHeader = response.headers.get('date');
  const adjustedServerTimeMs = (new Date(dateHeader)).getTime() + responseTime;
  const diffMs = Date.now() - adjustedServerTimeMs;
  const timeDiv = document.querySelector('.js-tuff-server-time');

  document.querySelector('.js-tuff-poll-button').disabled = false;

  setInterval(() => {
    __serverTimeMs = Date.now() - diffMs;

    timeDiv.textContent = (new Date(__serverTimeMs)).toLocaleTimeString();
  }, 1000);
}

function __tuff_onClickPollButton() {
  const loginTime = SIX_AM_MS - LOGIN_DURATION_MS;

  if (Date.now() < loginTime) {
    alert(`✋ Log in and begin polling after ${(new Date(loginTime)).toLocaleTimeString()}.`);
    return;
  }


  const selectValue = document.querySelector('.tuff-wrapper select').value;
  const { membershipId, passType, placeId } = __tuff_data[selectValue];
  const quantityInput = document.querySelector('.tuff-wrapper input');

  if (passType == 1) {
    quantityInput.value = 1;
  }

  const qty = quantityInput.value;

  localStorage.__tuff_DEFAULT_OPTION_SEARCH = selectValue;

  document.querySelector('.js-tuff-poll-button').disabled = true;

  __tuff_pollForPasses({
    _tries: 0,
    membershipId,
    qty,
    passType,
    placeId
  });
};

__tuff_addUi();
