# Search Functionality {: #search-functionality}
This document provides an overview of the search functionality implemented in the PhoenixVC-Modernized project using the `jekyll-search-plugin`.

## Overview {: #overview}
The search functionality allows users to quickly find relevant content across the documentation by typing keywords into the search bar. The implementation is lightweight, fast, and easy to customize.

## Features {: #features}
- **Client-Side Search**: Powered by JavaScript, no server-side processing is required.
- **Customizable Indexing**: You can configure which files and fields are indexed for search.
- **Real-Time Results**: Search results are displayed as the user types.

## Configuration {: #configuration}
The search functionality is configured via the `jekyll-search-plugin`. Below are the key steps to set it up:

1. **Install the Plugin**  
   Add the following to your `Gemfile`:
   ````ruby
   gem 'jekyll-search-plugin'
   ````

2. **Update `_config.yml`**  
   Configure the plugin by adding the following settings:
   ````yaml
   plugins:
     - jekyll-search-plugin

   search:
     exclude:
       - README.md
       - LICENSE
     index_fields:
       - title
       - content
   ````

3. **Include the Search Bar**  
   Add the search bar to your layout file (e.g., `default.html`):
   ````html
   <form id="search-form">
       <input type="text" id="search-input" placeholder="Search documentation...">
   </form>
   <ul id="search-results"></ul>
   ````

4. **Add JavaScript**  
   Ensure the `jekyll-search-plugin.js` script is included in your assets:
   ````html
   <script src="/assets/jekyll-search-plugin.js"></script>
   ````

## Customization {: #customization}
You can customize the search behavior by modifying the following:

- **Fields to Index**: Update the `index_fields` in `_config.yml`.
- **Excluded Files**: Specify files to exclude from indexing under the `exclude` field.
- **Styling**: Use CSS to style the search bar and results.

### Example CSS: {: #example-css}
````css
#search-form {
    margin: 20px 0;
}

#search-input {
    width: 100%;
    padding: 10px;
    font-size: 16px;
}

#search-results {
    list-style: none;
    padding: 0;
}

#search-results li {
    margin: 5px 0;
    padding: 10px;
    background: #f9f9f9;
    border: 1px solid #ddd;
}
````

## Troubleshooting {: #troubleshooting}
If the search functionality isn't working as expected, try the following:

- **Check Plugin Installation**: Ensure `jekyll-search-plugin` is correctly installed and listed in your `Gemfile.lock`.
- **Verify Configuration**: Confirm that `_config.yml` includes the correct plugin settings.
- **Inspect Console Errors**: Open the browser developer tools to check for JavaScript errors.

## Additional Resources {: #additional-resources}
For more details, refer to the official [jekyll-search-plugin documentation](https://github.com/christian-fei/Simple-Jekyll-Search).
