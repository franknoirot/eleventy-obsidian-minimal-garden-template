import { InputPathToUrlTransformPlugin } from "@11ty/eleventy";
import addContentLayoutsPlugin from "./addContentLayoutsPlugin.js";
import addInputDirectoryPlugin from "./addInputDirectoryPlugin.js";

const contentTypes = ["posts", "books", "projects", "now"];
const excludeFromNav = ["now"];

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default async function (eleventyConfig) {
  const outputAssetsPath = "/assets";
  eleventyConfig.setInputDirectory("content/public");
  eleventyConfig.setIncludesDirectory("../../_includes/");
  eleventyConfig.ignores.add("content/private");
  eleventyConfig.addPassthroughCopy({
    "content/public/_assets": outputAssetsPath,
    "_includes/styles": "/styles",
  });
  eleventyConfig.addGlobalData("layout", "layouts/base.njk");
  await eleventyConfig.addPlugin(addInputDirectoryPlugin, {
    patterns: ["./pages/**.md", "./pages/**.njk"],
    format: "utf-8",
  });

  eleventyConfig.addPlugin(InputPathToUrlTransformPlugin);

  await eleventyConfig.addPlugin(addContentLayoutsPlugin, {
    contentTypes: contentTypes.map((t) => ({
      dir: "content/public/" + t,
      name: t,
      layout: `layouts/${t}.njk`,
    })),
  });

  eleventyConfig.addPreprocessor(
    "obsidian:images",
    "njk,md,liquid",
    (data, content) => {
      // matches "![[someimage.jpg]]" as well as "![[someimage.jpg | This is some alt test]]"
      // capturing the url and the alt text separately
      const wikiLinkImages = new RegExp(/!\[\[(.*?)\s*(?:\|\s*(.*?))?\]\]/g);
      // matches "![some alt text](someimage.jpg)" for the same transformation
      const mdImages = new RegExp(/!\[(.*?)\]\((.*?)\)/g);
      // Prepend the image file name with the assets folder output location, leaving everything else the same

      const withMdLinksReplaced = content.replaceAll(
        mdImages,
        (match, alt, url) => {
          const newUrl = `${outputAssetsPath}/${url}`;
          return `![${alt}](${newUrl})`;
        },
      );
      const withWikiLinksReplaced = withMdLinksReplaced.replaceAll(
        wikiLinkImages,
        (match, url, alt) => {
          const newUrl = `${outputAssetsPath}/${url}`;
          const newAlt = alt ? ` "${alt}"` : "";
          return `![${url}${newAlt}](${newUrl})`;
        },
      );
      return withWikiLinksReplaced;
    },
  );

  let inputMap = {};
  eleventyConfig.on(
    "eleventy.contentMap",
    async ({ inputPathToUrl, urlToInputPath }) => {
      // inputPathToUrl is an object mapping input file paths to output URLs
      // urlToInputPath is an object mapping output URLs to input file paths
      inputMap = Object.entries(inputPathToUrl);
    },
  );
  /**
   * Obsidian is clever and lets users not include the full path to a file in a link,
   * and supports both wikilink and markdown syntax. This preprocessor will find all
   * the links in the content and replace them with the correct output path, all in markdown syntax.
   */
  eleventyConfig.addTransform("obsidian:links", async (content) => {
    // matches "[[some-file-slug]]" as well as "[[some-file-slug | some link text]]"
    // capturing the slug and the link text separately
    const wikiLinks = new RegExp(/\[\[(.*?)\s*(?:\|\s*(.*?))?\]\]/g);
    // matches "[some link text](some-file-slug)" for the same transformation
    // without matching on "![some alt text](someimage.jpg)" which is a different transformation
    const mdLinks = new RegExp(/\[(.*?)\]\((.*?)\)/g);

    const withMdLinksReplaced = content.replaceAll(
      mdLinks,
      (match, text, slug) => {
        const newUrl = inputMap.find(([key]) =>
          key.includes("/" + slug),
        )?.[1][0];
        console.log("link found", match, text, slug, newUrl);
        if (newUrl) {
          return `<a href="${newUrl}">${text || slug}</a>`;
        } else {
          return match;
        }
      },
    );
    const withWikiLinksReplaced = withMdLinksReplaced.replaceAll(
      wikiLinks,
      (match, slug, text) => {
        const newUrl = inputMap.find(([key]) =>
          key.includes("/" + slug),
        )?.[1][0];
        if (newUrl) {
          return `<a href="${newUrl}">${text || slug}</a>`;
        } else {
          return text || match;
        }
      },
    );
    return withWikiLinksReplaced;
  });

  /**
   * Adding any backlinks to each piece of content as computed data
   */
  eleventyConfig.addGlobalData("eleventyComputed.backlinks", () => {
    return (data) => {
      const { url, fileSlug } = data.page;
      return data.collections.all
        .filter(
          (item) => item.url !== url && item.page.rawInput.includes(fileSlug),
        )
        .map((item) => ({ url: item.url, title: item.data.title }));
    };
  });
}
