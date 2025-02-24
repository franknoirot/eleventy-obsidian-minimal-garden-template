---
layout: layouts/base.njk
---

# All my status updates

<ul>
{%- for update in collections.now -%}
  <li><a href="{{ update.url }}">{{ update.data.title }}</a></li>
{%- endfor -%}
</ul>
