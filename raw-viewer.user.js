// ==UserScript==
// @name         Unformatted Forum Post Viewer (Codecademy Discourse)
// @namespace    https://github.com/selectlearns
// @version      0.1
// @description  Adds a button to see the unformatted (raw) post
// @author       selectlearns (SelectAll in forums)
// @match        https://discuss.codecademy.com/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';
  console.log('UserScript loaded');

  const createRawButton = (topicId, postNumber) => {
    const rawButton = document.createElement('button');
    rawButton.setAttribute('data-topic-id', topicId);
    rawButton.setAttribute('data-post-number', postNumber);
    rawButton.setAttribute('class', 'raw-button widget-button btn-flat no-text btn-icon');
    rawButton.setAttribute('aria-label', 'get the raw text of this post');
    rawButton.setAttribute('title', 'get the raw text of this post');
    rawButton.innerHTML = `<svg class="fa d-icon d-icon-code svg-icon svg-string" xmlns="http://www.w3.org/2000/svg"><use xlink:href="#code"></use></svg>`;
    return rawButton;
  };

  const processPost = (node) => {
    if (node.querySelector('button.raw-button')) return;

    const topicId = node.getAttribute('data-topic-id');
    //const shareButton = node.querySelector('nav > div > button.widget-button.btn-flat.share.no-text.btn-icon');
    const shareButton = node.querySelector('button.share');
    const postNumber = shareButton && shareButton.getAttribute('data-post-number');
    console.log(topicId, postNumber);
    if (!topicId || !shareButton || !postNumber) return;

    const rawButton = createRawButton(topicId, postNumber);

    //shareButton.parentNode.insertBefore(rawButton, shareButton.nextSibling);
    shareButton.after(rawButton);
  };

  document.querySelectorAll('article').forEach(node => processPost(node));

  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      //console.log(mutation);
      for (const node of mutation.addedNodes) {
        if (node.nodeName === '#text') continue;

        if (node && node.classList && node.classList.contains('topic-post')) {
          //const post = node.querySelector('article');
          processPost(node.querySelector('article'));
        } else if (node && node.querySelectorAll) {
          node.querySelectorAll('article').forEach(node => processPost(node));
        } else {
          console.log(node);
          //console.log(mutation);
        }
      }
    }
  });
  observer.observe(document, { subtree: true, childList: true });
})();
