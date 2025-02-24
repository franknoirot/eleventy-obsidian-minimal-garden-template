---
layout: layouts/base.njk
---

# All my projects

<ul>
{%- for projects in collections.projects -%}
  <li><a href="{{ projects.url }}">{{ projects.data.title }}</a></li>
{%- endfor -%}
</ul>
