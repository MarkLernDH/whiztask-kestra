---
title: kestra_namespace_file
editLink: false
description: |-
  Use this data source to access information about an existing Namespace File
---

# kestra_namespace_file (Data Source)

Use this data source to access information about an existing Namespace File

## Example Usage

```hcl
data "kestra_namespace_file" "example" {
  namespace = "company.team"
  filename  = "myscript.py"
  content   = file("myscript.py")
}
```

<!-- schema generated by tfplugindocs -->
## Schema

### Required

- `filename` (String) The filename to the namespace file.
- `namespace` (String) The namespace of the namespace file resource.

### Read-Only

- `content` (String) Content to store in the file, expected to be a UTF-8 encoded string.
- `id` (String) The ID of this resource.
- `tenant_id` (String) The tenant id.