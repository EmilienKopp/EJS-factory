/**
* @file ejs-config.js
* @description Provides an interface to configure EditorJS
*/


/**
* Provides an interface to configure EditorJS
*/
export default class EJSConfig {

    /** API Endpoint for fetching Link Metadata **/
    LinkToolEndpoint = 'https://your-api-here/';

    /** API Endpoint for saving Attached Files **/
    AttachesToolEndpoint = 'https://your-api-here/';

    /** API Endpoint for saving Images by file name (upload) **/
    ImageToolFileEndpoint = 'https://your-api-here/';

    /** API Endpoint for saving Images by URL **/
    ImageToolUrlEndpoint = 'https://your-api-here/';

    Tools = [];

    EditorConfig = {};

    constructor () {
        this.EJSToolList.forEach(tool => {
            if (tool.active) {
                this.Tools.push(tool);
                import('@editorjs/' + tool.name + '/' + tool.name + '.js').then( () => {
                    console.log('Tool ' + tool.name + ' loaded.');
                });
            }
        });
    }

    /**
     * Define the tools you want to use in your editor.
     * Set to true the tools you want.
     */
    EJSToolList = {
        table: { className: Table, configName: 'table', moduleName: 'table', active: false },
        image : { className: ImageTool, configName: 'image', moduleName: 'image', active: false },
        embed : { className: Embed, configName: 'embed', moduleName: 'embed', active: false },
        link : { className: LinkTools, configName: 'linkTool', moduleName: 'link', active: false },
        warning : { className: Warning, configName: 'warning', moduleName: 'warning', active: false },
        quote : { className: Quote, configName: 'quote', moduleName: 'quote', active: false },
        code : { className: CodeTool, configName: 'code', moduleName: 'code', active: false },
        list : { className: List, configName: 'list', moduleName: 'list', active: false },
        header : { className: Header, configName: 'header', moduleName: 'header', active: false },
        delimiter : { className: Delimiter, configName: 'delimiter', moduleName: 'delimiter', active: false },
        attaches : { className: AttachesTool, configName: 'attaches', moduleName: 'attaches', active: false },
        marker : { className: Marker, configName: 'Marker', moduleName: 'marker', active: false }
    }

    setLinkEndpoint(endpoint) {
        this.LinkToolEndpoint = endpoint;
        this.Config.tools.linkTool.config.endpoint = endpoint;
    }

    setAttachesEndpoint(endpoint) {
        this.AttachesToolEndpoint = endpoint;
        this.Config.tools.attaches.config.endpoint = endpoint;
    }

    setImageFileEndpoint(endpoint) { 
        this.ImageToolFileEndpoint = endpoint;
        this.Config.tools.image.config.endpoints.byFile = endpoint;
    }

    setImageUrlEndpoint(endpoint) {
        this.ImageToolUrlEndpoint = endpoint;
        this.Config.tools.image.config.endpoints.byUrl = endpoint;
    }

    static DefaultEditorConfig = {
        holder: 'editorjs',
        tools: {
            delimiter: Delimiter,
            table: {
            class: Table,
            inlineToolbar: true,
            config: {
                rows: 3,
                cols: 3,
            },
            },
            linkTool: {
            class: LinkTool,
            config: {
                endpoint: '',
            },
            },
            attaches: {
            class: AttachesTool,
            config: {
                endpoint: '',
            },
            },
            warning: Warning,
            code: CodeTool,
            quote: {
            class: Quote,
            inlineToolbar: true,
            },
            Marker :{
            class : Marker,
            shortcut : 'CMD+SHIFT+M'
            },
            header: {
            class: Header,
            inlineToolbar: [
                'link', 'bold', 'italic'
            ],
            },
            image: {
            class: ImageTool,
            config: {
                endpoints: {
                    byFile: '',
                    byUrl: '',
                },
            }
            },
            list: {
            class: List,
            inlineToolbar: [
                'link','bold'
            ]
            },
            // Glitchy for some reason
            // tooltip: {
            //   class: Tooltip,
            //   config: {
            //     location: 'left',
            //     highlightColor: '#FFEDFD5',
            //     underline: true,
            //     backgroundColor: '#154360',
            //     textColor: '#FDFEFE',
            //   },
            // },
            embed : {
            class : Embed,
            inlineToolbar: false,
            config: {
                services: {
                youtube: true,
                coub: true
                }
            }
            },
        },
    }
}