// ==UserScript==
// @name        Day pass poller
// @description Day pass poller
// @namespace   tuff
// @include     https://www.discovercamping.ca/BCCWeb/Memberships/MembershipPasses.aspx
// @grant       none
// @version     0.1
// ==/UserScript==

const DEFAULT_QUANTITY = 2;
const POLL_DELAY = 500;
const DEFAULT_OPTION_SEARCH = 
  localStorage.__tuff_DEFAULT_OPTION_SEARCH || 'Rubble Creek Trailhead'; 

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

let __tuff_data = {};

function __tuff_pollForPasses(args) {
  var {membershipId, qty, passType = 2, placeId} = args;

  document.querySelector('.js-tuff-poll-count').textContent = args._tries;

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
}

async function __tuff_onPollSuccess(response, pollArgs) {
  if (response.d.Status == '1') {
    alert(`⭐ SUCCESS ⭐`);

    window.location.href = 'https://www.discovercamping.ca/BCCWeb/Customers/ShoppingCart.aspx';
    return;
  }

  console.log(`ℹ️ POLL ${_tries}`, response, pollArgs);
  
  if (response.d.Status == '-1') {
    $('#messageBoxLightbox2').css('z-index', 1300);
    $('#messageBoxLightbox2 .modal-body').html(
      `${response.d.Msg}<br><br>⏳ POLL COUNT: ${_tries}`
    );
    $('#messageBoxLightbox2 .modal-title').html('Information');
    $('#messageBoxLightbox2').modal();

    await new Promise(res => setTimeout(res, POLL_DELAY));

    __tuff_pollForPasses({
      ...pollArgs,
      _tries: _tries + 1,
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
  const titleDivs = [ ...document.querySelectorAll('[id^="tit_"][class^="bg_tit_card_"]') ];
  const data = titleDivs.map(div => {
    const parent = div.closest('.faq_main_box_div');
    const title = div.textContent.trim();
    const cartLink = parent.querySelector('.add_cart_card > a');
    let passData = {
      title,
      available: false,
      membershipId: null,
      passType: null,
      placeId: null,
    };

    if (cartLink) {
      const onclick = cartLink.getAttribute('onclick');
      const [, membershipId, passType, placeId] = onclick.match(/\((\d+),(\d+),(\d+),this/i);

      passData = {
        ...passData,
        available: true,
        membershipId,
        passType,
        placeId,
      };
    }

    return passData;
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

  console.log('__tuff_data', __tuff_data);

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

  pollButton.type = 'button';
  pollButton.innerHTML = `🧵 POLL <span class="js-tuff-poll-count"></span>`;
  pollButton.addEventListener('click', __tuff_onClickPollButton);
  wrapper.appendChild(pollButton);

  document.body.appendChild(wrapper);

  __tuff_printServerTime();
};

async function __tuff_printServerTime() {
  const start = Date.now();
  const response = await fetch(window.location.origin);
  const responseTime = Date.now() - start;
  const dateHeader = response.headers.get('date');
  const adjustedServerTime = (new Date(dateHeader)).getTime() + responseTime + 1000; 
  const diffMs = Date.now() - adjustedServerTime;
  const timeDiv = document.querySelector('.js-tuff-server-time');

  console.log('SERVER TIME', diffMs, (new Date(adjustedServerTime)));

  setInterval(() => {
    const date = new Date(Date.now() - diffMs);

    timeDiv.textContent = date.toLocaleTimeString(); 
  }, 1000); 
}

function __tuff_onClickPollButton() {
  const selectValue = document.querySelector('.tuff-wrapper select').value;
  const { membershipId, passType, placeId } = __tuff_data[selectValue];
  const quantityInput = document.querySelector('.tuff-wrapper input');

  if (passType == 1) {
    quantityInput.value = 1;
  }

  const qty = quantityInput.value;

  localStorage.__tuff_DEFAULT_OPTION_SEARCH = selectValue;

  __tuff_pollForPasses({
    _tries: 0,
    membershipId,
    qty,
    passType,
    placeId
  });
};

__tuff_addUi();
