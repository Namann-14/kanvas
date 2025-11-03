// @ts-nocheck -- skip type checking
import * as d_docs_2 from "../docs/setup.md?collection=docs";
import * as d_docs_1 from "../docs/prd.md?collection=docs";
import * as d_docs_0 from "../docs/index.md?collection=docs";
import { _runtime } from "fumadocs-mdx/runtime/next";
import * as _source from "../source.config";
export const docs = _runtime.docs<typeof _source.docs>(
  [
    { info: { path: "index.md", fullPath: "docs\\index.md" }, data: d_docs_0 },
    { info: { path: "prd.md", fullPath: "docs\\prd.md" }, data: d_docs_1 },
    { info: { path: "setup.md", fullPath: "docs\\setup.md" }, data: d_docs_2 },
  ],
  [
    {
      info: { path: "meta.json", fullPath: "docs\\meta.json" },
      data: { title: "Documentation", pages: ["index", "prd", "setup"] },
    },
  ],
);
