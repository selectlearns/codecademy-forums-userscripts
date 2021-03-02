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

  const insertRawView = () => {
    const styles = {
      position: 'absolute',
      zIndex: 300,
      boxShadow: '0 4px 14px rgb(0 0 0 / 15%)',
      backgroundColor: 'var(--secondary)'
    };
    const div = document.createElement('div');
    div.setAttribute('id', 'raw-view');
    div.setAttribute('class', 'ember-view');
    for (const style in styles) {
      div.style[style] = styles[style];
    }

    div.innerHTML = `<textarea id="raw-text" spellcheck="false" style="width: 100%; height: 100%;" class="d-editor-input ember-text-area ember-view"></textarea>`;
    div.querySelector('#raw-text').onclick = (event) => event.stopPropagation();
    document.getElementById('share-link').after(div);
    return div;
  };

  const showRawView = (text, left, top, width, height) => {
    const rawView = document.getElementById('raw-view') || insertRawView();
    rawView.querySelector('#raw-text').value = text;
    rawView.style.left = `${left}px`;
    rawView.style.top = `${top}px`;
    rawView.style.width = `${width}px`;
    rawView.style.height = `${height}px`;
    rawView.style.display = 'block';
    document.body.addEventListener('click', () => rawView.style.display = 'none', { once: true });
  };

  const handleRawClick = async (event) => {
    event.stopPropagation();

    const { topicId, postNumber } = event.currentTarget.dataset;
    const post = event.currentTarget.closest('div.contents').querySelector('div.cooked');
    console.log(post);
    const rawUrl = `https://discuss.codecademy.com/raw/${topicId}/${postNumber}`;
    console.log('Clicked', topicId, postNumber);

    let text;
    try {
      const response = await fetch(rawUrl);
      if (response.ok) {
        text = await response.text();
      } else {
        text = `Unable to load.\n\nGo to:\n${rawUrl}`;
      }
    } catch (error) {
      text = `Network error encountered.\n\nGo to:\n${rawUrl}`;
    }

    console.log(text);
    const pos = post.getBoundingClientRect();
    console.log(pos);
    showRawView(text, pos.left + window.scrollX, pos.top + window.scrollY, post.clientWidth, post.clientHeight);

  };

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
    //console.log(topicId, postNumber);
    if (!topicId || !shareButton || !postNumber) return;

    const rawButton = createRawButton(topicId, postNumber);
    rawButton.addEventListener('click', handleRawClick);

    //shareButton.parentNode.insertBefore(rawButton, shareButton.nextSibling);
    shareButton.after(rawButton);
  };

  document.querySelectorAll('article').forEach(node => processPost(node));

  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      //console.log(mutation);
      for (const node of mutation.addedNodes) {
        if (node.querySelectorAll) {
          node.querySelectorAll('article').forEach(node => processPost(node));
        }
      }
    }
  });
  observer.observe(document, { subtree: true, childList: true });
})();
