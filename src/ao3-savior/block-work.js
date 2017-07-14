const CSS_NAMESPACE = 'ao3-savior';

const getCut = (work) => {
  const cut = document.createElement('div');

  cut.className = `${CSS_NAMESPACE}-cut`;
  cut.innerHTML = work.innerHTML;

  return cut;
};

const getFold = (reason) => {
  const fold = document.createElement('div');
  const note = document.createElement('span');

  fold.className = `${CSS_NAMESPACE}-fold`;
  note.className = `${CSS_NAMESPACE}-note`;

  note.innerHTML = `This work is hidden!`;

  fold.appendChild(note);
  fold.append(' ');
  fold.appendChild(getReasonSpan(reason));
  fold.appendChild(getToggleButton());

  return fold;
};

const getToggleButton = () => {
  const button = document.createElement('button');
  const unhideClassFragment = ` ${CSS_NAMESPACE}-unhide`;

  button.innerHTML = 'Unhide';
  button.className = `${CSS_NAMESPACE}-toggle`;

  button.addEventListener('click', event => {
    const work = event.target.closest(`.${CSS_NAMESPACE}-work`);

    if (work.className.indexOf(unhideClassFragment) !== -1) {
      work.className = work.className.replace(unhideClassFragment, '');
      work.querySelector(`.${CSS_NAMESPACE}-note`).innerHTML = 'This work is hidden.';
      event.target.innerHTML = 'Unhide';
    } else {
      work.className += unhideClassFragment;
      work.querySelector(`.${CSS_NAMESPACE}-note`).innerHTML = 'This work was hidden.';
      event.target.innerHTML = 'Hide';
    }
  });

  return button;
};

const getReasonSpan = reason => {
  const span = document.createElement('span');
  const {tag, author, title, summary} = reason;
  let text;

  if (tag) {
    text = `tags include <strong>${tag}</strong>`;
  } else if (author) {
    text = `authors include <strong>${author}</strong>`;
  } else if (title) {
    text = `title is <strong>${title}</strong>`;
  } else if (summary) {
    text = `summary includes <strong>${summary}</strong>`;
  }

  if (text) {
    span.innerHTML = `(Reason: ${text}.)`;
  }

  span.className = `${CSS_NAMESPACE}-reason`;

  return span;
};

export default function blockWork(work, reason, config) {
  if (!reason) return;

  const {showReasons, showPlaceholders} = config;

  if (showPlaceholders) {
    const fold = getFold(reason);
    const cut = getCut(work);

    work.className += ` ${CSS_NAMESPACE}-work`;
    work.innerHTML = '';
    work.appendChild(fold);
    work.appendChild(cut);

    if (!showReasons) {
      work.className += ` ${CSS_NAMESPACE}-hide-reasons`;
    }
  } else {
    work.className += ` ${CSS_NAMESPACE}-hidden`;
  }
}

