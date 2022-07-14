/*
 * EJSBlueprint - Object Template
 * Blueprint to parse the Object saved by editorjs - represents the "data" property of the editor's OutputData object
 *   
 */
export default class EJSBlueprint {

    constructor() {
        // ...
    }

    time;
    blocks = {
        type,
        classList,
        data : {
            text,
            level,
            anchor,
            style,
            items,
            url,
            withBorder,
            withBackground,
            stretched,
            file : {
                url,
                size,
                name,
                extension,
                originalName,
                id,
                blockId,
                title,
            },
            alt,
            caption,
            content,
            withHeadings,
            service,
            source,
            embed,
            width,
            height,
            alignment,
            code,
            language,
            link,
            meta : {
                title,
                site_name,
                description,
                image : {
                    url
                }
            },
            message
        }
    };
    version;
}