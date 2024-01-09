# Adding Servers

If you want to add further servers to the official Pixelic-API's Tracking open a pull request for the `servers.ts` file following the instructions listed below:

```JSON
{
  "ID" : "HYPIXEL",
  "host" : "mc.hypixel.net",
  "name" : "Hypixel"
}
```

- `ID` » Server's Name in UPPERCASE and Spaces replaced with underscores **NO SPECIAL CHARACTERS**
- `host` » Server's Domain which is used to connect to the Server
- `name` » Server's name

Append the JSON Object mentioned above following the Schema provided to the already existing array in the `servers.ts` file.
