import addStyle from './add-style';
import blockWork from './block-work';
import getBlockReason from './get-block-reason';
import isDebug from './is-debug';
import {selectFromBlurb, selectFromWork} from './select-blockables';

setTimeout(() => {
  const debugMode = isDebug(window.location);
  const config = window.ao3SaviorConfig;
  const workContainer = document.querySelector('#main.works-show') || 
    document.querySelector('#main.chapters-show');
  let blocked = 0;
  let total = 0;

  if (debugMode) {
    console.groupCollapsed('AO3 SAVIOR');

    if (!config) {
      console.warn('Exiting due to missing config.');
      return;
    }
  }

  addStyle();

  Array.from(document.querySelectorAll('li.blurb'))
    .forEach(blurb => {
      const blockables = selectFromBlurb(blurb);
      const reason = getBlockReason(blockables, config);

      total++;

      if (reason) {
        blockWork(blurb, reason, config);
        blocked++;

        if (debugMode) {
          console.groupCollapsed(`- blocked ${blurb.id}`);
          console.log(blurb, reason);
          console.groupEnd();
        }
      } else if (debugMode) {
        console.groupCollapsed(`  skipped ${blurb.id}`);
        console.log(blurb);
        console.groupEnd();
      }
    });

  if (config.alertOnVisit && workContainer &&
    document.referrer.indexOf('//archiveofourown.org') === -1) {

    const blockables = selectFromWork(workContainer);
    const reason = getBlockReason(blockables, config);
    
    if (reason) {
      blocked++;
      blockWork(workContainer, reason, config)
    }
  }

  if (debugMode) {
    console.log(`Blocked ${blocked} out of ${total} works`);
    console.groupEnd();
  }
}, 10);
