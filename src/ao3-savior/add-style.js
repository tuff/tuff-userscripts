const STYLE = `
  html body .ao3-savior-hidden.ao3-savior-hidden {
    display: none;
  }
  
  .ao3-savior-cut {
    display: none;
  }
  
  .ao3-savior-cut::after {
    clear: both;
    content: '';
    display: block;
  }
  
  .ao3-savior-reason {
    margin-left: 5px;
  }
  
  .ao3-savior-hide-reasons .ao3-savior-reason {
    display: none;
  }
  
  .ao3-savior-unhide .ao3-savior-cut {
    display: block;
  }
  
  .ao3-savior-fold {
    align-items: center;
    display: flex;
    justify-content: flex-start;
  }
  
  .ao3-savior-unhide .ao3-savior-fold {
    border-bottom: 1px dashed;
    margin-bottom: 15px;
    padding-bottom: 5px;
  }
  
  button.ao3-savior-toggle {
    margin-left: auto;
  }
`;

export default function addStyle() {
  const style = document.createElement('style');
  style.innerHTML = STYLE;
  style.className = 'ao3-savior';

  document.head.appendChild(style);
}
