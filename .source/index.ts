// @ts-nocheck -- skip type checking
import * as d_docs_7 from "../docs/api/workspaces.mdx?collection=docs";
import * as d_docs_6 from "../docs/api/tasks.mdx?collection=docs";
import * as d_docs_5 from "../docs/api/columns.mdx?collection=docs";
import * as d_docs_4 from "../docs/api/boards.mdx?collection=docs";
import * as d_docs_3 from "../docs/setup.md?collection=docs";
import * as d_docs_2 from "../docs/prd.md?collection=docs";
import * as d_docs_1 from "../docs/index.md?collection=docs";
import * as d_docs_0 from "../docs/adding-data.md?collection=docs";
import { _runtime } from "fumadocs-mdx/runtime/next";
import * as _source from "../source.config";
export const docs = _runtime.docs<typeof _source.docs>(
  [
    {
      info: { path: "adding-data.md", fullPath: "docs\\adding-data.md" },
      data: d_docs_0,
    },
    { info: { path: "index.md", fullPath: "docs\\index.md" }, data: d_docs_1 },
    { info: { path: "prd.md", fullPath: "docs\\prd.md" }, data: d_docs_2 },
    { info: { path: "setup.md", fullPath: "docs\\setup.md" }, data: d_docs_3 },
    {
      info: { path: "api/boards.mdx", fullPath: "docs\\api\\boards.mdx" },
      data: d_docs_4,
    },
    {
      info: { path: "api/columns.mdx", fullPath: "docs\\api\\columns.mdx" },
      data: d_docs_5,
    },
    {
      info: { path: "api/tasks.mdx", fullPath: "docs\\api\\tasks.mdx" },
      data: d_docs_6,
    },
    {
      info: {
        path: "api/workspaces.mdx",
        fullPath: "docs\\api\\workspaces.mdx",
      },
      data: d_docs_7,
    },
  ],
  [
    {
      info: { path: "meta.json", fullPath: "docs\\meta.json" },
      data: { title: "Documentation", pages: ["index", "prd", "setup"] },
    },
  ],
);
