// https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-remark-images/src/index.js

import { newImgMarkUp } from './helper';
import { JSDOM } from 'jsdom';

import { log, registerPlugin, yellow } from '@scullyio/scully';


export const blurUp = async (html: string) => {

  const dom = new JSDOM(html);
  const { window } = dom;
  const imgs = window.document.querySelectorAll('img');

  log(yellow(`found ${imgs.length} images`));
  for (let i = 0; i < imgs.length; i++) {

    const mediaUrl = imgs[i].src;
    const caption = imgs[i].alt || 'Some Neat Media';

    const markupAST = await newImgMarkUp(mediaUrl, caption);
    const span = window.document.createElement(markupAST.tagName);
    span.classList.add(markupAST.props.class);
    span.setAttribute('style', markupAST.props.style);


    markupAST.children.forEach((c) => {
      const el = window.document.createElement(c.tagName);
      el.classList.add(c.props.class);
      el.setAttribute('style', c.props.style);
      el.setAttribute('src', c.props.src);
      el.setAttribute('srcset',c.props.srcset);
      el.setAttribute('alt',c.props.alt);
      el.title = c.props.title;
      el.setAttribute('sizes',c.props.sizes);


      span.appendChild(el);
    });


    imgs[i].replaceWith(span);
  }

  return dom.serialize();
};

const validator = async conf => [];

const blurUpPlugin = 'blurUp';

registerPlugin('render', blurUpPlugin, blurUp, validator);

