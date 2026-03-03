# FeedJS Core

FeedJS Core is the heart of the FeedJS template engine. It provides the parser, AST (Abstract Syntax Tree), IR (Intermediate Representation), and VDOM (Virtual DOM) components needed to compile and render templates.

## Features

- **HTML Parser**: Parses `.feedjs.html` templates into an AST
- **Template Directives**: Built-in support for:
  - `f-if` / `f-else` - Conditional rendering
  - `f-for` - List rendering with iteration
  - `f-text` - Text content binding
  - `f-html` - HTML content binding
  - `f-bind:*` - Attribute binding
  - `f-on:*` - Event handling
- **Interpolation**: `{{ expression }}` syntax for inline expressions
- **Layout System**: `<layout src="...">` and `<slot>` support for template inheritance

## Installation

```bash
npm install feedjs-core
```

## Usage

### Parse a Template

```typescript
import { parseTemplate, transformAST, createVDOM } from 'feedjs-core';

const template = `
<div>
  <h1 f-text="title"></h1>
  <p>{{ message }}</p>
  <ul>
    <li f-for="item in items" f-text="item.name"></li>
  </ul>
</div>
`;

const ast = parseTemplate(template);
const ir = transformAST(ast);
const vnode = createVDOM(ir, { title: 'Hello', message: 'World', items: [{ name: 'Item 1' }] });
```

### Template Syntax

#### Text Binding

```html
<span f-text="username"></span>
```

#### Interpolation

```html
<p>Hello, {{ username }}!</p>
<p>Total: {{ price * quantity }}</p>
```

#### Attribute Binding

```html
<input f-bind:value="inputValue">
<input f-bind:checked="isSelected">
<img f-bind:src="imageUrl">
```

#### Event Handling

```html
<button f-on:click="handleClick">Click Me</button>
<form f-on:submit="handleSubmit">
```

#### Conditionals

```html
<div f-if="isLoggedIn">
  Welcome, {{ username }}!
</div>
<div f-else>
  Please log in.
</div>
```

#### Loops

```html
<ul>
  <li f-for="item in items" f-key="item.id">
    {{ item.name }}
  </li>
</ul>
```

#### Layouts

**Layout file (layout.feedjs.html):**
```html
<header>
  <h1>My App</h1>
</header>
<main>
  <slot></slot>
</main>
<footer>
  &copy; 2024
</footer>
```

**Page file (page.feedjs.html):**
```html
<layout src="./layout.feedjs.html">
  <p>This content goes into the slot!</p>
</layout>
```

## API

### `parseTemplate(html: string): FeedAST`

Parses an HTML template string into an Abstract Syntax Tree.

### `transformAST(ast: FeedAST): IRNode[]`

Transforms the AST into an Intermediate Representation.

### `createVDOM(ir: IRNode | IRNode[], state: object): VNode`

Creates a Virtual DOM tree from the IR using the provided state.

## License

MIT
