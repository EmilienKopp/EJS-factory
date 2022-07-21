// import EJSBlueprint from "./ejs-blueprint.js";
import { isJSON, isSelfClosingTag, setProtocol, SmartLogger } from "../utils/streamline.js";
import HtmlBricks from "./ejs-html-bricks.js";
import hljs from 'highlight.js';

const LOG_LEVEL = 2;
const TIMERS = false;

const Logger = new SmartLogger(LOG_LEVEL, TIMERS);

export default class EJSHtmlBuilder {

    /**------------------------------------------------------------------------------------------/
     * Properties
     *------------------------------------------------------------------------------------------*/
    
    /**
     * Parsed JSON object to represent the blocks from the editor
     * @type {object}
     * @memberof EJSHtmlBuilder
     */
    rawData;
    
    /**
     * HTML Element to receive the constructed HTML
     * @type {Element}
     * @memberof EJSHtmlBuilder
     */
    target;

    /**
     * Main container for the other subsequent bricks
     * @type {HtmlBricks}
     * @memberof EJSHtmlBuilder
     */
    container = new HtmlBricks();

    /**
     * HTML string representing all the HTML code built with the EJSHtmlBuilder object
     * @type {string}
     * @memberof EJSHtmlBuilder
     */
    html = "";

    /**
     * Raw mode, when active, sets the building mode to hard-coded text building of the HTML
     * @type {boolean}
     * @memberof EJSHtmlBuilder
     * @default false
     */
    rawMode = false;
    
    /**
     * Builder object to receive all the methods allowing to build the bricks depending on a given block type
     * @type {object}
     * @memberof EJSHtmlBuilder
     * @example builder.paragraph = function(block) { // do something }
     * // Define what to do with a block of type paragraph
     */
    builder = {}; 

    /**
     * Collection of code highlighting libraries available
     * @static
     * @memberof EJSHtmlBuilder
     */
    static highlighters = {
      'hljs' : {
          CDN: "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.6.0/styles/monokai-sublime.min.css",
          classes: ['hljs'],
          lines: true,
          action: () => {},
      },
    }
  
    /**
     * Code highlighter in use
     * @default hljs
     * @type {string}
     * @memberof EJSHtmlBuilder
     */
    static codeHighlighter = 'hljs';

    /**
     * Object representing the default CSS classes for the bricks
     * @type {object}
     * @memberof EJSHtmlBuilder
     */
    cssClassMap;
    
    /**
     * Constructor, creates the EJSHtmlBuilder object from a JSON string representing the blocks from the editor
     * @param {string} data JSON string representing the blocks from the editor
     */
    constructor(data = null) {
      Logger.SmartLog(1,'Constructing EJSHtmlBuilder');
      Logger.SmartTime('Execution time - constructor');

      if (!data) {
        console.info('No data provided, creating an empty EJSHtmlBuilder object.');
        return;
      }
      /** Parsing the JSON string into an object **/
      this.rawData = JSON.parse(data);

      /** Initialize the highlighters, only if the data has a 'code' type block in it. **/
      if(this.rawData.blocks.find(block => block.type === 'code')) {

        /**
         * Initialize the 'highlight.js' library as an 'hljs' object with the .action() function to highlight the code blocks.
         * @param {string} code The actual code string
         * @param {string} language The language in which the code is written
         * @returns {void}
         */
        EJSHtmlBuilder.highlighters.hljs.action = function(code, language = null) {
          if (language) {
            return hljs.highlight(language, code).value;
          } else {
            return hljs.highlightAuto(code).value;
          }
        }
      }// EndIf


      /** Initialize all the helper function to replace the use of a giant switch/case **/

      /**
       * PARAGRAPH BLOCK
       * How to build HTML from a block of type paragraph
       * @param {object} block Block object
       * @param {HtmlBricks} container parent brick to receive the object
       * @memberof EJSHtmlBuilder.builder
       * @example builder.paragraph = function(block, container) { // do something }
       */
      this.builder.paragraph = function(block, container) {
        // Building in Raw Mode (from static text)
        if (this.rawMode) {
          this.html += `<p>${block.data.text}</p>`;
          return this.html;
        }

        // Building in Bricks Mode, using HTML Bricks
        let paragraphBrick = new HtmlBricks().on(container)
                    .fromBlock(block)
                    .withText(block.data.text);
        paragraphBrick.lay();
      } // this.builder.paragraph()

      /**
       * HEADER BLOCK
       * How to build HTML from a block of type header
       * @param {object} block Block object
       * @param {HtmlBricks} container parent brick to receive the object
       * @memberof EJSHtmlBuilder.builder
       * @example builder.header = function(block, container) { // do something }
       */
      this.builder.header = function(block, container) {
        // Building in Raw Mode (from static text)
        if (this.rawMode) {
          this.html += `<h${block.data.level}>${block.data.text}</h${block.data.level}>`;
          return this.html;
        }
      
        // Building in Bricks Mode, using HTML Bricks
        let headerBrick = new HtmlBricks().on(container)
                              .fromBlock(block)
                              .withText(block.data.text);
        headerBrick.lay();
      } // this.builder.header()

      /**
       * LIST BLOCK
       * How to build HTML from a block of type list
       * @param {object} block Block object
       * @param {HtmlBricks} container parent brick to receive the object
       * @memberof EJSHtmlBuilder.builder
       * @example builder.list = function(block, container) { // do something }
       */
      this.builder.list = function(block, container) {
        // Building in Raw Mode (from static text)
        if (this.rawMode) {
          let type = block.data.style == "ordered" ? 'ol' : 'ul';
          this.html += `<${type}>`;
          block.data.items.forEach( item => {
            let li = `<li>${item}</li>`;
            this.html += li;
          });
          this.html += `</${type}>`;
          return this.html;
        }

        // Building in Bricks Mode, using HTML Bricks
        let listBrick = new HtmlBricks().on(container)
                       .fromBlock(block);
        listBrick.lay();
        block.data.items.forEach( itemText => {
          let li = new HtmlBricks().on(listBrick)
                        .fromTag('li')
                        .withText(itemText);
          li.lay();
        });
      }// this.builder.list()

      /**
       * IMAGE BLOCK
       * How to build HTML from a block of type image
       * @param {object} block Block object
       * @param {HtmlBricks} container parent brick to receive the object
       * @memberof EJSHtmlBuilder.builder
       * @example builder.iamge = function(block, container) { // do something }
       */
      this.builder.image = function(block, container) {
        // Building in Raw Mode (from static text)
        if (this.rawMode) {
          this.html += `<img src="${block.data.file.url}" alt="${block.data.file.alt}"/>`;
          this.html += `<span class="editor-image-caption">${block.data.caption}</span>`;
          return this.html;
        }

        // Building in Bricks Mode, using HTML Bricks
        if (!block.data.file.url) {
          console.error('No image URL provided for image block.');
          block.data.file.url = 'https://dummyimage.com/300x300&text=Image+Not+Found';
        }
        let alt = block.data.file.alt ? block.data.file.alt : 'No text provided for this image.';
        let attributes = [ 
          {name: 'src', value: block.data.file.url}, 
          {name: 'alt', value: alt} 
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

      /**
       * EMBED BLOCK
       * How to build HTML from a block of type embed
       * @param {object} block Block object
       * @param {HtmlBricks} container parent brick to receive the object
       * @memberof EJSHtmlBuilder.builder
       * @example builder.embed = function(block, container) { // do something }
       */
      this.builder.embed = function(block, container) {
        // Building in Raw Mode (from static text)
        if (this.rawMode) {
          this.html += `<iframe src="${block.data.url}" width="${block.data.width}" height="${block.data.height}" frameborder="0" allowfullscreen></iframe>`;
          return this.html;
        }
        
        // Building in Bricks Mode, using HTML Bricks

        // Setting attributes for the iframe
        // TODO: Add support for templating
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

      /**
       * CODE BLOCK
       * How to build HTML from a block of type code
       * @param {object} block Block object
       * @param {HtmlBricks} container parent brick to receive the object
       * @memberof EJSHtmlBuilder.builder
       * @example builder.code = function(block, container) { // do something }
       * @TODO Add support for language recognition and linting
       */
      this.builder.code = function(block, container) {

        // import CSS for highlighting
        EJSHtmlBuilder.addHighlighterCSS();

        // Building in Raw Mode (from static text)
        if (this.rawMode) {
          this.html += `<pre><code>${block.data.code}</code></pre>`;
          return this.html;
        }

        // Building in Bricks Mode, using HTML Bricks
        let preBrick = new HtmlBricks().on(container)
                          .fromTag('pre');
        preBrick.lay();

        let highlightedHTML = EJSHtmlBuilder.highlighters[EJSHtmlBuilder.codeHighlighter].action(block.data.code);
        Logger.SmartLog(2, 'Highlighted code: ',highlightedHTML);

        let codeBrick = new HtmlBricks().on(preBrick)
                            .fromBlock(block)
                            .withHTML(highlightedHTML);
        codeBrick.lay();
      }

      /**
       * QUOTE BLOCK
       * How to build HTML from a block of type quote
       * @param {object} block Block object
       * @param {HtmlBricks} container parent brick to receive the object
       * @memberof EJSHtmlBuilder.builder
       * @example builder.quote = function(block, container) { // do something }
       */
      this.builder.quote = function(block, container) {
        // Building in Raw Mode (from static text)
        if (this.rawMode) {
          this.html += `<blockquote class="blockquote">"${block.data.text}"</blockquote>`;
          this.html += `<span class="blockquote-caption">${block.data.caption}</span>`;
          return this.html;
        }
        
        // Building in Bricks Mode, using HTML Bricks
        let quoteBrick = new HtmlBricks().on(container)
                            .fromBlock(block)
                            .withText(block.data.text);
        quoteBrick.lay();

        // Adding the caption if it exists
        if (block.data.caption) {
          let caption = new HtmlBricks().on(quoteBrick)
                        .fromProperty('caption')
                        .withText(block.data.caption);
          caption.lay();
        }
      }// this.builder.quote()

      /**
       * TABLE BLOCK
       * How to build HTML from a block of type table
       * @param {object} block Block object
       * @param {HtmlBricks} container parent brick to receive the object
       * @memberof EJSHtmlBuilder.builder
       * @example builder.table = function(block, container) { // do something }
       */
      this.builder.table = function(block, container) {
        // Building in Raw Mode (from static text)
        if (this.rawMode) {
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

        // Building in Bricks Mode, using HTML Bricks
        let tableBrick = new HtmlBricks().on(container)
                            .fromBlock(block);
        tableBrick.lay();

        // Iterate over the rows
        block.data.content.forEach( (row, index) => {
          // if this is the first iteration, create the thead
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


          } else {
            // On the second iteration, create the tbody
            if (index == 1) {
              var tbodyBrick = new HtmlBricks().on(tableBrick)
                                    .fromTag('tbody');
              tbodyBrick.lay();
            }

            // Create the rows
            let tr = new HtmlBricks().on(tbodyBrick)
                            .fromTag('tr');
            tr.lay();

            // Create the cells
            row.forEach( cell => {
              let td = new HtmlBricks().on(tr)
                            .fromTag('td')
                            .withText(cell);
              td.lay();
            });
          }
        });
      } // this.builder.table()

      /**
       * DELIMITER
       * How to build HTML from a block of type delimiter (hr)
       * @param {object} block Block object
       * @param {HtmlBricks} container parent brick to receive the object
       * @memberof EJSHtmlBuilder.builder
       * @example builder.delimiter = function(block, container) { // do something }
       */
      this.builder.delimiter = function(block, container) {
        // Building in Raw Mode (from static text)
        if(this.rawMode) {
          this.html += `<hr/>`;
          return this.html;
        }

        // Building in Bricks Mode, using HTML Bricks
        let hrBrick = new HtmlBricks().on(container)
                            .fromBlock(block);
        hrBrick.lay();
      } // this.builder.delimiter()

      /**
       * How to build HTML from a block of type media
       * @param {object} block Block object
       * @param {HtmlBricks} container parent brick to receive the object
       * @memberof EJSHtmlBuilder.builder
       * @example builder.media = function(block, container) { // do something }
       */
      this.builder.media = function(block, container) {
        // Building in Raw Mode (from static text)
        if (this.rawMode) {
          this.html += `<div class="media">`;
          block.data.items.forEach( item => {
            this.html += `<div class="media-body">${item}</div>`;
          });
          this.html = `</div>`;
          return this.html;
        }

        // Building in Bricks Mode, using HTML Bricks
        let mediaBrick = new HtmlBricks().on(container)
                            .fromBlock(block);
        mediaBrick.lay();

        let mediaBodyBrick = new HtmlBricks().on(mediaBrick)
                              .fromProperty('body');
        mediaBodyBrick.lay();
      } // this.builder.media()


      /**
       * How to build HTML from a block of type warning
       * @param {object} block Block object
       * @param {HtmlBricks} container parent brick to receive the object
       * @memberof EJSHtmlBuilder.builder
       * @example builder.warning = function(block, container) { // do something }
       */
      this.builder.warning = function(block, container) {
        // Building in Raw Mode (from static text)
        if (this.rawMode) {
          this.html += `<div class="warning-title">${block.data.title}</div>`;
          this.html += `<div class="warning-message">${block.data.message}</div>`;
          return this.html;
        }
        
        // Building in Bricks Mode, using HTML Bricks

        // Create the warning brick (div by default)
        let warningBrick = new HtmlBricks().on(container)
                            .fromBlock(block);
        warningBrick.lay();

        // Create the icon
        let iconBrick = new HtmlBricks().on(warningBrick)
                            .fromProperty('icon');
        iconBrick.lay();

        // Create the title brick
        if (block.data.title) {
          let titleBrick = new HtmlBricks().on(warningBrick)
                              .fromProperty('title')
                              .withText(block.data.title);
          titleBrick.lay();
        }

        // Create the message brick
        if (block.data.message) {
          let messageBrick = new HtmlBricks().on(warningBrick)
                                .fromProperty('message')
                                .withText(block.data.message);
          messageBrick.lay();
        }

      } // this.builder.warning()

      /**
       * How to build HTML from a block of type linkTool
       * @param {object} block Block object
       * @param {HtmlBricks} container parent brick to receive the object
       * @memberof EJSHtmlBuilder.builder
       * @example builder.linkTool = function(block, container) { // do something }
       * @TODO Add support for templating for image HTML attributes as src and alt
       */
      this.builder.linkTool = function(block, container) {
        Logger.SmartLog(3,'linkToolBuilder : block => ', block);

        // Building in Raw Mode (from static text)
        var link = setProtocol(block.data.link);
        var title = block.data.meta.title ? block.data.meta.title : "No Title";
        var description = block.data.meta.description ? block.data.meta.description : "No Description";
        if (this.rawMode) {
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

        // Building in Bricks Mode, using HTML Bricks
        let linkToolBrick = new HtmlBricks().on(container)
                                .fromBlock(block);
        linkToolBrick.lay();

        let linkBrick = new HtmlBricks().on(linkToolBrick)
                              .fromProperty('link');
        linkBrick.lay();

        /** IF LINK HAS AN IMAGE **/
        if(block.data.meta.image && block.data.meta.image.url) {
          let linkImageWrapperBrick = new HtmlBricks().on(linkBrick)
                                          .fromProperty('linkImg');
          linkImageWrapperBrick.lay();

          // TODO: Allow templating for the image attributes
          let imgAttributes = [
            {name: 'src', value: block.data.meta.image.url},
            {name: 'alt', value: title}
          ];
          Logger.SmartLog(4,'imgAttributes', imgAttributes);
          let linkImageBrick = new HtmlBricks().on(linkImageWrapperBrick)
                                  .fromProperty('image')
                                  .withAttributes(imgAttributes);
          Logger.SmartLog(4,'linkImageBrick',linkImageBrick);
          linkImageBrick.lay();
        }
        /** END IF IMAGE **/

        // Create the title brick
        let linkTitleBrick = new HtmlBricks().on(linkBrick)
                              .fromProperty('title')
                              .withText(title);
        linkTitleBrick.lay();

        // Create the description brick
        let linkDescriptionBrick = new HtmlBricks().on(linkBrick)
                              .fromProperty('description')
                              .withText(description);
        linkDescriptionBrick.lay();

        // Create the anchor brick
        let linkAnchorBrick = new HtmlBricks().on(linkBrick)
                              .fromProperty('anchor')
                              .withText(link);
        linkAnchorBrick.lay();

      } //this.builder.linkTool()

      /**
       * How to build HTML from a block of type 'attaches'
       * @param {object} block Block object
       * @param {HtmlBricks} container parent brick to receive the object
       * @memberof EJSHtmlBuilder.builder
       * @example builder.attaches = function(block, container) { // do something }
       */
      this.builder.attaches = function(block, container) {

        var url = block.data.file.url;
        var filename = block.data.title;

        // Building in Raw Mode (from static text)
        if (this.rawMode) {
          this.html +=
                `<a class="file-link" href="${url}" target="_blank" rel="nofollow noindex noreferrer">
                <div class="file-block">
                  <span class="fiv-cla fiv-icon-ppt fiv-size-lg"></span>&nbsp;
                  <span class="file-name">${filename}</span>
                </div></a>`;
        }// rawMode

        // Building in Bricks Mode, using HTML Bricks

        // Create the main container (usually 'a' tag)
        let attachesBrick = new HtmlBricks().on(container)
                            .fromBlock(block)
                            .withAttributes([
                              {name: 'href', value: url},
                            ]);
        Logger.SmartLog(4,'attachesBrick', attachesBrick);
        attachesBrick.lay();

        // Create the file block
        let fileBlockBrick = new HtmlBricks().on(attachesBrick)
                              .fromProperty('fileBlock');
        fileBlockBrick.lay();

        // Create the file icon
        let fileIconBrick = new HtmlBricks().on(fileBlockBrick)
                              .fromProperty('icon');
        fileIconBrick.lay();

        // Create the file name
        let fileNameBrick = new HtmlBricks().on(fileBlockBrick)
                              .fromProperty('fileName')
                              .withText(filename);
        fileNameBrick.lay();
      }// this.builder.attaches()
      
      Logger.SmartTimeEnd('Execution time - constructor');
    }// constructor

    /**
     * Build the HTML from the rawData of the EJSHtmlBuilder object and appends it to the target container
     * @param {Element} target HtmlElement to receive the constructed HTML
     * @param {boolean} raw Raw mode (build from hard coded text) or not, defaults to false
     * @returns {string} HTML string of all the blocks
     */
    build(raw = false) {
      this.rawMode = raw;

      // Build the HTML in Raw Mode (from static text)
      if (this.rawMode) {
        Logger.SmartLog(2,"Building HTML");
        Logger.SmartTime('Execution time - txt build');


          this.html = `<div class="codex-editor"><div class="codex-editor__redactor" style="padding-bottom:300px;">`;
          this.rawData.blocks.forEach( block => {
            this.builder[block.type](block);
          });

          this.html += `</div></div>`;

        Logger.SmartTimeEnd('Execution time - txt build');
        return this.html;

      } else {
        // Build the HTML in Bricks Mode (using HTML Bricks)
        Logger.SmartTime('Execution time - bricks build');
        
        // Create the generic container (usually 'div' tag) and set it as Root element
        this.container = new HtmlBricks().fromTag('div').asRoot();
        Logger.SmartLog(3,'container', this.container);

        // Create the wrapper (usually 'div' tag) that has specific classes for rendering the HTML (default: codex-editor)
        let wrapper = new HtmlBricks().on(this.container)
                              .fromProperty('wrapper');
        wrapper.lay();

        // Create the redactor (usually 'div' tag) that has specific classes for rendering the HTML (default: codex-editor__redactor)
        let subWrapper = new HtmlBricks().on(wrapper)
                              .fromProperty('subWrapper');
        subWrapper.lay();

        // Create the HtmlBricks for each block, calling the builder functions on each block type
        this.rawData.blocks.forEach( (block, index) => {
          Logger.SmartLog(3,'**** EJSHtmlBuilder.build() - from Bricks - iterating on block@', index);
          Logger.SmartLog(3,'Create block : ', block.type);
          this.builder[block.type](block, subWrapper);
        });

        Logger.SmartTimeEnd('Execution time - bricks build');
        Logger.SmartLog(4,'container innerHTML : ', this.container.htmlelement.innerHTML);
        return this.container.htmlelement.innerHTML;
      }
    }


    /**
     * Convert a JSON string to an HTML string in order to display it as pure HTML. Uses hard coded text.
     * @param {string} data JSON object
     * @returns {string} String of HTML code
     * @static
     * @notice Doesn't allow customization of attributes and classes
     * @notice This function creates HTML from hard coded text. It is not recommended to use this function in production.
     * @warning This function is not optimized for performance.
     * @memberof EJSHtmlBuilder
     */
    static JSONtoHTMLstring(data) {
        Logger.SmartTime('Execution time');

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
                let link = setProtocol(block.data.link);
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

          Logger.SmartTimeEnd('Execution time');
          return htmlstring;
    }

    /**
     * Reverse the stack of bricks representing the HTML document into a JSON string.
     * @param {object[]} brickStack array of HtmlBricks objects
     * @returns {string} JSON string
     * @static
     * @warning This function might not be supported in your current version of this package.
     * @TODO Implement in a future version
     * @memberof EJSHtmlBuilder
     */
    static reverse(brickStack) {
      // TODO - implement
    }

    /**
     * Sanitize a string to be displayed in a 'code' block.
     * @param {string} dirtyString string to be sanitized
     * @returns {string} sanitized string
     * @static
     * @memberof EJSHtmlBuilder
     */
    static sanitizeCode(dirtyString) {
      return dirtyString.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    /**
     * Sets the highlighter library to use for highlighting code blocks
     * @static
     * @param {string} libraryName Name of the library to use
     * @returns {void}
     * @memberof HtmlBricks
     * @example HtmlBricks.setHighlighterLibrary('highlight.js') // set the highlighter library to use to 'highlight.js'
     */
      static setHighlighterLibrary(libraryName) {
        EJSHtmlBuilder.codeHighlighter = libraryName;
      }
  
      /**
       * Add a <link> tag to the head of the document only if it is not already there to import CSS for the code highlighter
       * @static
       * @param {string} highlighterName Name of the highlighting tool to import CSS for
       * @returns {HtmlBricks} return brick for chaining
       * @memberof HtmlBricks
       */
      static addHighlighterCSS(){
          if(!document.querySelector('link[href="'+ EJSHtmlBuilder.highlighters[EJSHtmlBuilder.codeHighlighter].CDN +'"]')) {
              let link = document.createElement('link');
              link.setAttribute('rel', 'stylesheet');
              link.setAttribute('href', EJSHtmlBuilder.highlighters[EJSHtmlBuilder.codeHighlighter].CDN);
              document.head.appendChild(link);
          }
          return this;
      }

}
