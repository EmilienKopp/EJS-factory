# JSON to HTML parsing library for EditorJS

Takes the edited content from EditorJS (saved as a JSON object) to render static HTML outside of the editor.

This library is currently under development and needs optimization.

## Current structure:



### Bricks
`HtmlBricks` class defines an object template based on the JSON structure of the `OutputData` received from EditorJS.
In order to render the data defined in JSON, the template defines, for each `block` object outputted by EditorJS :
- An HTML tag
- A CSS class
- A list of HTML attributes
All of the above are programmatically customizable by the user of this library.

### Builder
`EJSHtmlBuilder` class defines the methods and procedures to build the static HTML from `HtmlBricks` objects.
Instances of `EJSHtmlBuilder` are used to take JSON output from EditorJS and build the HTML. Constructed with:
- JSON raw data from EditorJS

Use the `.build()` method to generate an HTML string.
