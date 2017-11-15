// ==UserScript==
// @name          jira-backlog-scroll
// @description   Scroll-to buttons for JIRA backlog
// @namespace     jira-backlog-scroll
// @include       https://jira.*.com/*RapidBoard*
// @include       https://*.atlassian.net/*RapidBoard*
// @grant         none
// @version       0.1
// @downloadURL   https://github.com/tuff/tuff-userscripts/raw/master/uncompiled/jira-backlog-sroll.user.js
// ==/UserScript==


const SEL_CONTAINER = '#ghx-backlog';
const SEL_BACKLOG = '.ghx-backlog-group';
const SEL_SPRINT = '.js-sprint-container';
const CSS_PREFIX = 'jira-scroll-script__';
const BACKLOG_URL_PARAM = 'view=planning';

let __mounted = false;


window.setInterval(shouldInit, 500);

function shouldInit() {
  if (window.location.href.indexOf(BACKLOG_URL_PARAM) > 0) {
    if (__mounted) return;

    const container = getContainer();

    if (container && container.scrollHeight > window.innerHeight) {
      init();
      __mounted = true;
    }
  } else {
    cleanup();
    __mounted = false;
  }
}

function init() {
  const container = getContainer();
  const backlog = document.querySelector(SEL_BACKLOG);
  const sprints = [...document.querySelectorAll(SEL_SPRINT)];

  const dom = {
    style: document.createElement('style'),
    wrapper: document.createElement('div'),
    backlogTopButton: document.createElement('button'),
    backlogBottomButton: document.createElement('button'),
  };

  const css = `
    .${CSS_PREFIX}wrapper {
      color: #111;
      display: inline-block;
      max-width: 50vw;
      vertical-align: middle;
    }

    .${CSS_PREFIX}wrapper button {
      background: #b3efea;;
      border: 1px solid #3b5343;
      border-radius: 3px;
      margin: 2px;
      padding: 2px 4px;
      position: relative;
    }

    button.${CSS_PREFIX}sprint {
      background: #e7ff48;
    }
  `;

  function scrollContentTo(scrollTop) {
    container.scrollTop = scrollTop;
  }

  function scrollToBacklogTop() {
    container.scrollTop = backlog.offsetTop;
  }

  function scrollToBacklogBottom() {
    container.scrollTop = container.scrollHeight;
  }

  function scrollToSprintTop(index = 0) {
    container.scrollTop = sprints[index].offsetTop;
  }

  (function addDom() {
    const domTarget = document.querySelector('#ghx-modes-tools');

    dom.style.className = `${CSS_PREFIX}style`;
    dom.style.innerHTML = css;
    document.head.appendChild(dom.style);

    dom.backlogTopButton.innerHTML = '&#8593; backlog';
    dom.backlogTopButton.addEventListener('click', scrollToBacklogTop);
    dom.wrapper.appendChild(dom.backlogTopButton);

    dom.backlogBottomButton.innerHTML = 'backlog &#8595;';
    dom.backlogBottomButton.addEventListener('click', scrollToBacklogBottom);
    dom.wrapper.appendChild(dom.backlogBottomButton);

    sprints.forEach((sprint, i) => {
      const button = document.createElement('button');
      const sprintName = sprint.querySelector('.ghx-name').innerText;

      button.className = `${CSS_PREFIX}sprint`;
      button.innerHTML = `Sprint: ${sprintName.replace(/ .*$/g, '')}`;
      button.title = `${sprintName}`;
      button.addEventListener('click', () => scrollToSprintTop(i));

      dom.wrapper.appendChild(button);
    });

    dom.wrapper.className = `${CSS_PREFIX}wrapper`;
    domTarget.insertBefore(dom.wrapper, domTarget.firstChild);
  })();

  console.log('==== jira-backlog-scroll init ====');
}

function cleanup() {
  const wrapper = document.querySelector(`.${CSS_PREFIX}wrapper`);
  const style = document.querySelector(`.${CSS_PREFIX}style`);

  if (wrapper) {
    wrapper.parentElement.removeChild(wrapper);
    console.log('==== jira-backlog-scroll cleanup ====');
  }

  if (style) {
    style.parentElement.removeChild(style);
  }
}

function getContainer() {
  return document.querySelector(SEL_CONTAINER);
}
