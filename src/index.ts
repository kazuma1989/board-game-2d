// @ts-check
/// <reference path="./typings.d.ts" />

import {
  html,
  render,
} from "https://cdn.skypack.dev/htm/preact/standalone.module.js"
import { App } from "./App.js"

render(html`<${App} />`, document.body)
