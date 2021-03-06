// ==UserScript==
// @name         Unformatted Forum Post Viewer (Codecademy Discourse)
// @namespace    https://github.com/selectlearns
// @version      1.1
// @description  Adds a button to see the unformatted (raw) post
// @author       selectlearns (SelectAll in forums)
// @match        https://discuss.codecademy.com/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const handleRawClick = async (postId, topicId, postNumber) => {
    const post = document.querySelector(`article[data-post-id='${postId}']`).querySelector('div.cooked');
    const rawUrl = `https://discuss.codecademy.com/raw/${topicId}/${postNumber}`;

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

    const pos = post.getBoundingClientRect();
    showRawView(text, pos.left + window.scrollX, pos.top + window.scrollY, post.clientWidth, post.clientHeight);
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

    div.innerHTML = `<textarea id="raw-text" readonly spellcheck="false" style="width: 100%; height: 100%;" class="d-editor-input ember-text-area ember-view"></textarea>`;
    div.querySelector('#raw-text').onclick = (event) => event.stopPropagation();
    document.getElementById('share-link').after(div);
    return div;
  };

  const withPluginApi = require('discourse/lib/plugin-api').withPluginApi;

  withPluginApi('0.8', api => {

    api.attachWidgetAction('post', 'rawButton', function () {
      handleRawClick(this.attrs.id, this.attrs.topicId, this.attrs.post_number);
    });

    api.addPostMenuButton('raw', () => {
      return {
        action: 'rawButton',
        icon: 'code',
        className: 'raw-button',
        title: 'get the raw text of this post',
        position: 'second-last-hidden'
      };
    });

  });

})();
