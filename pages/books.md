---
layout: layouts/base.njk
---

# All my books

<ul>
{%- for book in collections.books -%}
  <li><a href="{{ book.url }}">{{ book.data.title }}</a></li>
{%- endfor -%}
</ul>
