import addStyle from './add-style';
import blockWork from './block-work';
import getBlockReason from './get-block-reason';
import isDebug from './is-debug';
import selectWorkBlockables from './select-work-blockables';

setTimeout(() => {
  const debugMode = isDebug(window.location);
  const config = window.ao3SaviorConfig;
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
    .forEach(work => {
      const blockables = selectWorkBlockables(work);
      const reason = getBlockReason(blockables, config);

      total++;

      if (reason) {
        blockWork(work, reason, config);
        blocked++;

        if (debugMode) {
          console.groupCollapsed(`- blocked ${work.id}`);
          console.log(work, reason);
          console.groupEnd();
        }
      } else if (debugMode) {
        console.groupCollapsed(`  skipped ${work.id}`);
        console.log(work);
        console.groupEnd();
      }
    });

    if (debugMode) {
      console.log(`Blocked ${blocked} out of ${total} works`);
      console.groupEnd();
    }
}, 10);
