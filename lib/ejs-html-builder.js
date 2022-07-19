// import EJSBlueprint from "./ejs-blueprint.js";
import * as Streamline from "../utils/streamline.js";
import HtmlBricks from "./ejs-html-bricks.js";


export default class EJSHtmlBuilder {

    // Properties
    rawData; // JSON Data
    target; //Html Element to receive the constructed HTML
    blueprint; // Object Structure
    container = new HtmlBricks();
    html = "";
    rawMode = false;
    
    builder = {}; 

    cssClassMap;
    
    constructor(data = null) {
      console.log("EJSHtmlBuilder constructor");
      console.time('Execution time - constructor');
      if (!data) {
        return;
      }
      this.rawData = data;

      /** Initialize all the helper function to replace the use of the giant switch/case **/
      this.builder.paragraph = function(block, container) {
        if (rawMode) {
          this.html += `<p>${block.data.text}</p>`;
          return this.html;
        }

        let paragraphBrick = new HtmlBricks().on(container)
                    .fromBlock(block)
                    .withText(block.data.text);
        paragraphBrick.lay();
      } // this.builder.paragraph()

      this.builder.header = function(block, container) {
        if (rawMode) {
          this.html += `<h${block.data.level}>${block.data.text}</h${block.data.level}>`;
          return this.html;
        }
      
        let headerBrick = new HtmlBricks().on(container)
                              .fromBlock(block)
                              .withText(block.data.text);
        headerBrick.lay();
      } // this.builder.header()

      this.builder.list = function(block, container) {
        if (rawMode) {
          let type = block.data.style == "ordered" ? 'ol' : 'ul';
          this.html += `<${type}>`;
          block.data.items.forEach( item => {
            let li = `<li>${item}</li>`;
            this.html += li;
          });
          this.html += `</${type}>`;
          return this.html;
        }

        // Bricking the list
        let listBrick = new HtmlBricks().on(container)
                       .fromBlock(block);
        listBrick.lay();
        block.data.items.forEach( itemText => {
          let li = new HtmlBricks().on(list)
                        .fromTag('li')
                        .withText(itemText);
          li.lay();
        });
      }// this.builder.list()

      this.builder.image = function(block, container) {
        if (rawMode) {
          this.html += `<img src="${block.data.url}" alt="${block.data.alt}"/>`;
          this.html += `<span class="editor-image-caption">${block.data.caption}</span>`;
          return this.html;
        }

        let attributes = [ 
          {name: 'src', value: block.data.url}, 
          {name: 'alt', value: block.data.alt} 
        ];
        let img = new HtmlBricks().on(container)
                      .fromBlock(block)
                      .withAttributes(attributes);
        img.lay();

        if (block.data.caption) {
          let caption = new HtmlBricks().on(img)
                        .fromProperty('caption')
                        .withText(block.data.caption);
          caption.lay();
        }
      }// this.builder.image()

      this.builder.embed = function(block, container) {
        if (rawMode) {
          this.html += `<iframe src="${block.data.url}" width="${block.data.width}" height="${block.data.height}" frameborder="0" allowfullscreen></iframe>`;
          return this.html;
        }
        
        let attributes = [
          {name: 'src', value: block.data.url},
          {name: 'width', value: block.data.width},
          {name: 'height', value: block.data.height},
          {name: 'frameborder', value: 0},
          {name: 'allowfullscreen', value: true}
        ];

        let iframeBrick = new HtmlBricks().on(container)
                          .fromBlock(block)
                          .withAttributes(attributes);
        iframeBrick.lay();
      
      } // this.builder.embed()

      this.builder.code = function(block, container) {
        // TODO : Implement language recognition and linting
        if (rawMode) {
          this.html += `<pre><code>${block.data.text}</code></pre>`;
          return this.html;
        }
        let preBrick = new HtmlBricks().on(container)
                          .fromTag('pre');
        preBrick.lay();

        let codeBrick = new HtmlBricks().on(preBrick)
                            .fromBlock(block)
                            .withText(block.data.text);
        codeBrick.lay();
      }

      this.builder.quote = function(block, container) {
        if (rawMode) {
          this.html += `<blockquote class="blockquote">"${block.data.text}"</blockquote>`;
          this.html += `<span class="blockquote-caption">${block.data.caption}</span>`;
          return this.html;
        }
        
        let quoteBrick = new HtmlBricks().on(container)
                            .fromBlock(block)
                            .withText(block.data.text);
        quoteBrick.lay();

        if (block.data.caption) {
          let caption = new HtmlBricks().on(quoteBrick)
                        .fromProperty('caption')
                        .withText(block.data.caption);
          caption.lay();
        }
      }// this.builder.quote()

      this.builder.table = function(block, container) {
        if (rawMode) {
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
          return this.html;
        }

        let tableBrick = new HtmlBricks().on(container)
                            .fromBlock(block);
        tableBrick.lay();
        block.data.content.forEach( (row, index) => {
          if(index == 0) {
            let thead = new HtmlBricks().on(tableBrick)
                              .fromTag('thead');
            thead.lay();
            row.forEach( cell => {
              let th = new HtmlBricks().on(thead)
                            .fromTag('th')
                            .withText(cell);
              th.lay();
            });
            let tbodyBrick = new HtmlBricks().on(tableBrick)
                              .fromTag('tbody');
            tbodyBrick.lay();

          } else {
            let tr = new HtmlBricks().on(tbodyBrick)
                            .fromTag('tr');
            tr.lay();
            row.forEach( cell => {
              let td = new HtmlBricks().on(tr)
                            .fromTag('td')
                            .withText(cell);
              td.lay();
            });
          }
        });
      }

      this.builder.hr = function(block, container) {
        if(rawMode) {
          this.html += `<hr/>`;
          return this.html;
        }
        let hrBrick = new HtmlBricks().on(container)
                            .fromBlock(block);
        hrBrick.lay();
      }

      this.builder.media = function(block, container) {
        if (rawMode) {
          this.html += `<div class="media">`;
          block.data.items.forEach( item => {
            this.html += `<div class="media-body">${item}</div>`;
          });
          this.html = `</div>`;
          return this.html;
        }

        let mediaBrick = new HtmlBricks().on(container)
                            .fromBlock(block);
        mediaBrick.lay();
        let mediaBodyBrick = new HtmlBricks().on(mediaBrick)
                              .fromProperty('body');
        mediaBodyBrick.lay();
      }

      this.builder.warning = function(block, container) {
        if (rawMode) {
          this.html += `<div class="warning-title">${block.data.title}</div>`;
          this.html += `<div class="warning-message">${block.data.message}</div>`;
          return this.html;
        }
        
        let warningBrick = new HtmlBricks().on(container)
                            .fromBlock(block);
        warningBrick.lay();
        

      }

      this.builder.linkTool = function(block, container) {
        var link = Streamline.setProtocol(block.data.link);
        var title = block.data.meta.title ? block.data.meta.title : "No Title";
        var description = block.data.meta.description ? block.data.meta.description : "No Description";
        if (rawMode) {
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
        } //rawMode

        let linkToolBrick = new HtmlBricks().on(container)
                            .fromBlock(block);
        linkToolBrick.lay();

        let linkBrick = new HtmlBricks().on(linkToolBrick)
                              .fromProperty('link');
        linkBrick.lay();

        let linkImageWrapperBrick = new HtmlBricks().on(linkBrick)
                                    .fromProperty('linkImg');
        linkImageWrapperBrick.lay();

        let imgAttributes = [
          {name: 'src', value: block.data.meta.image.url},
          {name: 'alt', value: title}
        ];
        let linkImageBrick = new HtmlBricks().on(linkImageWrapperBrick)
                              .fromProperty('image')
                              .withAttributes(imgAttributes);
        linkImageBrick.lay();

        let linkTitleBrick = new HtmlBricks().on(linkBrick)
                              .fromProperty('title')
                              .withText(title);
        linkTitleBrick.lay();

        let linkDescriptionBrick = new HtmlBricks().on(linkBrick)
                              .fromProperty('description')
                              .withText(description);
        linkDescriptionBrick.lay();

        let linkAnchorBrick = new HtmlBricks().on(linkBrick)
                              .fromProperty('anchor')
                              .withText(link);
        linkAnchorBrick.lay();

      } //this.builder.linkTool()

      this.builder.attaches = function(block, container) {
        var url = block.data.file.url;
        var filename = block.data.title;

        if (rawMode) {
          this.html +=
                `<a class="file-link" href="${url}" target="_blank" rel="nofollow noindex noreferrer">
                <div class="file-block">
                  <span class="fiv-cla fiv-icon-ppt fiv-size-lg"></span>&nbsp;
                  <span class="file-name">${filename}</span>
                </div></a>`;
        }// rawMode

        let attachesBrick = new HtmlBricks().on(container)
                            .fromBlock(block)
                            .withAttributes([
                              {name: 'href', value: url},
                            ]);
        attachesBrick.lay();

        let fileBlockBrick = new HtmlBricks().on(attachesBrick)
                              .fromProperty('fileBlock');
        fileBlockBrick.lay();

        let fileIconBrick = new HtmlBricks().on(fileBlockBrick)
                              .fromProperty('icon');
        fileIconBrick.lay();

        let fileNameBrick = new HtmlBricks().on(fileBlockBrick)
                              .fromProperty('fileName');
        fileNameBrick.lay();
      }// this.builder.attaches()
      
      console.timeEnd('Execution time - constructor');
    }// constructor

    /**
     * Build the HTML from the rawData of the EJSHtmlBuilder object and appends it to the target container
     * @param {Element} target HtmlElement to receive the constructed HTML
     * @param {boolean} raw Raw mode (build from hard coded text) or not, defaults to false
     * @returns 
     */
    build(target, raw = false) {
      this.rawMode = raw;
      this.target = target;
      
      

      if (this.rawMode) {
        console.log("Building HTML");
        console.time('Execution time - txt build');


          this.html = `<div class="codex-editor"><div class="codex-editor__redactor" style="padding-bottom:300px;">`;
          this.rawData.blocks.forEach( block => {
            this.builder[block.type](block);
          });

          this.html += `</div></div>`;

        console.timeEnd('Execution time - txt build');
        target.innerHTML = this.html;
        return this.html;

      } else {
        console.time('Execution time - bricks build');
        // Using HTML Bricks

        this.container = new HtmlBricks().fromElement(target).asRoot();

        let wrapper = new HtmlBricks().on(this.container)
                              .fromProperty('wrapper');
        wrapper.lay();

        let subWrapper = new HtmlBricks().on(wrapper)
                              .fromProperty('subWrapper');
        subWrapper.lay();

        this.rawData.blocks.forEach( block => {
          this.builder[block.type](block, subWrapper);
        });

        console.timeEnd('Execution time - bricks build');
        return this.container.innerHTML;
      }
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
