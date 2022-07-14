import EJSBlueprint from "./ejs-blueprint.js";
import * as Streamline from "../utils/streamline.js";
import HtmlStructure from "./ejs-html-bricks.js";
import HtmlBricks from "./ejs-html-bricks.js";

export default class EJSHtmlBuilder {

    // Properties
    rawData; // JSON Data
    blueprint = new EJSBlueprint(); // Object Structure
    container = new Element(); // HTML Element
    html = "";
    
    
    builder = {paragraph, header, list, image, embed, code, quote, table, hr, warning, linkTool, media, attaches}; 

    cssClassMap;
    
    constructor(data = null) {
      console.log("EJSHtmlBuilder constructor");
      console.time('Execution time');
      if (!data) {
        return;
      }
      this.rawData = data;

      /** Initialize all the helper function to replace the use of the switch/case **/
      this.builder.paragraph = function(block) {
        this.html += `<p>${block.data.text}</p>`;
        let element = HtmlBricks.lay(block, container);
        element.innerText = block.data.text;
      }

      this.builder.header = function(block) {
        this.html += `<h${block.data.level}>${block.data.text}</h${block.data.level}>`;
        let element = HtmlBricks.lay(block, container);
        element.innerText = block.data.text;
      }

      this.builder.list = function(block) {
        let type = block.data.style == "ordered" ? 'ol' : 'ul';
        this.html += `<${type}>`;
        block.data.items.forEach( item => {
          let li = `<li>${item}</li>`;
          this.html += li;
        });
        this.html += `</${type}>`;

        let element = HtmlBricks.lay(block, container);
        element.innerText = block.data.text;

      }

      this.builder.image = function(block) {
        this.html += `<img src="${block.data.url}" alt="${block.data.alt}"/>`;
        this.html += `<span class="editor-image-caption">${block.data.caption}</span>`;
      }

      this.builder.embed = function(block) {
        this.html += `<iframe src="${block.data.url}" width="${block.data.width}" height="${block.data.height}" frameborder="0" allowfullscreen></iframe>`;
      }

      this.builder.code = function(block) {
        // TODO : Implement language recognition and linting
        this.html += `<pre><code>${block.data.content}</code></pre>`;
      }

      this.builder.quote = function(block) {
        this.html += `<blockquote class="blockquote">"${block.data.text}"</blockquote>`;
        this.html += `<span class="blockquote-caption">${block.data.caption}</span>`;
      }

      this.builder.table = function(block) {
        this.html = `<table>`;
        block.data.content.forEach( (row, index) => {
          // if this is the first iteration, create the header
          if (index == 0) {
            this.html += `<thead>`;
            row.forEach( cell => {
              this.html += `<th>${cell}</th>`;
            });
            this.html += `</thead>`;
          } else {
            this.html += `<tr>`;
            row.forEach( cell => {
              this.html += `<td>${cell}</td>`;
            });
            this.html += `</tr>`;
          }
        });
        this.html += `</table>`;
      }

      this.builder.hr = function(block) {
        this.html += `<hr/>`;
      }

      this.builder.media = function(block) {
        this.html += `<div class="media">`;
        block.data.items.forEach( item => {
          this.html += `<div class="media-body">${item}</div>`;
        });
        this.html = `</div>`;
      }

      this.builder.warning = function(block) {
        this.html += `<div class="warning-title">${block.data.title}</div>`;
        this.html += `<div class="warning-message">${block.data.message}</div>`;
      }

      this.builder.linkTool = function(block) {
        let link = Streamline.setProtocol(block.data.link);
        let title = block.data.meta.title ? block.data.meta.title : "No Title";
        let description = block.data.meta.description ? block.data.meta.description : "No Description";
        let imageDIV = '';

        if (block.data.meta.image && block.data.meta.image.url) {
          imageDIV = `<div class="link-tool__image"><img src="${block.data.meta.image.url}" alt="${title}" /></div>`;
        }
        this.html += `<div class="link-tool">
                    <a class="link-tool__content link-tool__content--rendered" target="_blank" rel="nofollow noindex noreferrer" href="${link}">`;
        this.html += imageDIV;            
        this.html +=  `<div class="link-tool__title">${title}</div>
                    <p class="link-tool__description">${description}</p>
                    <span class="link-tool__anchor">${link}</span></a>
                  </div>`;
      }

      this.builder.attaches = function(block) {
        let url = block.data.file.url;
        let filename = block.data.title;
        this.html +=
              `<a class="file-link" href="${url}" target="_blank" rel="nofollow noindex noreferrer">
              <div class="file-block">
                <span class="fiv-cla fiv-icon-ppt fiv-size-lg"></span>&nbsp;
                <span class="file-name">${filename}</span>
              </div></a>`;
      }
      
      console.timeEnd('Execution time');
    }

    build() {
      console.log("Building HTML");
      console.time('Execution time');

        let blueprint = EJSBlueprint();
        if (!isJSON(data)) {
            return data;
        }
        blueprint = JSON.parse(data);
        this.html = `<div class="codex-editor"> <div class="codex-editor__redactor" style="padding-bottom:300px;">`;
        blueprint.blocks.forEach( block => {
          this.builder[block.type](block);
        });

        this.html += `</div></div>`;
        console.timeEnd('Execution time');
        return this.html;
    }


    /**
     * Convert a JSON string to an HTML string in order to display it as pure HTML
     * 
     * @param {string} data JSON object
     * @returns {string} String of HTML code
     * @memberof EJSHtmlBuilder
     */
    static JSONtoHTMLstring(data) {
        console.time('Execution time');

        let blueprint = EJSBlueprint();
        if (!isJSON(data)) {
            return data;
        }
        blueprint = JSON.parse(data);
        let htmlstring = `<div class="codex-editor"> <div class="codex-editor__redactor" style="padding-bottom:300px;">`;
        let markup = "";
        blueprint.blocks.forEach( (block, index) => {
            switch (block.type) {
              case 'paragraph':
                markup = `<p>${block.data.text}</p>`
                break;
              case 'header':
                markup =`<h${block.data.level}>${block.data.text}</h${block.data.level}>`
                break;
              case 'list':
                let type = block.data.style == "ordered" ? 'ol' : 'ul';
                markup = `<${type}>`;
                block.data.items.forEach( item => {
                  let li = `<li>${item}</li>`;
                  markup += li;
                });
                markup = `</${type}>`;
                break;
              case 'image':
                markup = `<img src="${block.data.file.url}" alt="${block.data.alt}" />`;
                markup += `<span class="editor-image-caption">${block.data.caption}</span>`;
                break;
              case 'embed':
                markup = `<iframe src="${block.data.url}" width="${block.data.width}" height="${block.data.height}" frameborder="0" allowfullscreen></iframe>`;
                break;
              case 'quote':
                markup = `<blockquote class="blockquote">"${block.data.text}"</blockquote>`;
                markup += `<span class="blockquote-caption">${block.data.caption}</span>`;
                break;
              case 'code':
                markup = `<pre><code>${block.data.code}</code></pre>`;
                break;
              case 'table': // Foreach on a two dimensional array of strings to create a table, the first array is the header, the others are the rows
                markup = `<table>`;
                block.data.content.forEach( (row, index) => {
                  // if this is the first iteration, create the header
                  if (index == 0) {
                    markup += `<thead>`;
                    row.forEach( cell => {
                      markup += `<th>${cell}</th>`;
                    });
                    markup += `</thead>`;
                  } else {
                    markup += `<tr>`;
                    row.forEach( cell => {
                      markup += `<td>${cell}</td>`;
                    });
                    markup += `</tr>`;
                  }
                });
                markup += `</table>`;
                break;
              case 'hr':
                markup = `<hr>`;
                break;
              case 'warning':
                markup = `<div class="warning-title">${block.data.title}</div>`;
                markup += `<div class="warning-message">${block.data.message}</div>`;
                break;
              case 'linkTool':
                let link = Streamline.setProtocol(block.data.link);
                let title = block.data.meta.title ? block.data.meta.title : "No Title";
                let description = block.data.meta.description ? block.data.meta.description : "No Description";
                let imageDIV = '';

                if (block.data.meta.image && block.data.meta.image.url) {
                  imageDIV = `<div class="link-tool__image"><img src="${block.data.meta.image.url}" alt="${title}" /></div>`;
                }
                markup = `<div class="link-tool">
                            <a class="link-tool__content link-tool__content--rendered" target="_blank" rel="nofollow noindex noreferrer" href="${link}">`;
                markup += imageDIV;            
                markup +=  `<div class="link-tool__title">${title}</div>
                            <p class="link-tool__description">${description}</p>
                            <span class="link-tool__anchor">${link}</span></a>
                          </div>`;
                break;
              case 'media':
                markup = `<div class="media">`;
                block.data.items.forEach( item => {
                  markup += `<div class="media-body">${item}</div>`;
                });
                markup = `</div>`;
                break;
              case 'attaches':
                let url = block.data.file.url;
                let filename = block.data.title;
                markup =
                      `<a class="file-link" href="${url}" target="_blank" rel="nofollow noindex noreferrer">
                      <div class="file-block">
                        
                        
                        <span class="fiv-cla fiv-icon-ppt fiv-size-lg"></span>&nbsp;
                        <span class="file-name">${filename}</span>
                        
                      </div></a>`;
                break;
              default:
                markup = `<p>The block ${block.type} could not be created.</p>`;
                break;
            }
            htmlstring += markup;
            
          });
          htmlstring += `</div></div>`;

          console.timeEnd('Execution time');
          return htmlstring;
    }

    /**
     * Reverse the HTML string into a JSON string
     * @param {string} htmlstring String of HTML code
     * @returns {string} JSON object
     * @memberof EJSHtmlBuilder
     */
    static reverse(htmlstring) {
      // TODO - implement
    }

}
