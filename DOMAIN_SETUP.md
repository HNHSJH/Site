# Custom domain setup for GitHub Pages

Replace `example.com` and `USERNAME` / `ORGANIZATION` below with the client's actual domain and GitHub owner.

## 1. Publish the site first

In the GitHub repository:

1. Open **Settings → Pages**.
2. Set the publishing source to the branch/folder containing `index.html` (normally `main` / root).
3. Confirm the temporary `github.io` site loads correctly.

## 2. Add the custom domain in GitHub

In **Settings → Pages → Custom domain**, enter the client's preferred domain, for example:

- `example.com`, or
- `www.example.com`

GitHub will begin a DNS check.

## 3. Update DNS at the client's current DNS provider

### If using the root/apex domain (`example.com`)

Add these four A records:

| Type | Host | Value |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |

You can also use the supported GitHub Pages IPv6 `AAAA` records if desired.

### If using `www.example.com`

Add a CNAME:

| Type | Host | Value |
|---|---|---|
| CNAME | www | `USERNAME.github.io` or `ORGANIZATION.github.io` |

A common setup is to configure the apex domain in GitHub Pages and point `www` to the GitHub Pages hostname; GitHub can redirect between the two when configured correctly.

## 4. Do not delete unrelated DNS records

If the client uses email on the same domain, keep existing **MX**, SPF/DKIM/DMARC **TXT**, and other service records intact. Only replace the website-related A/AAAA/CNAME records that currently point the website elsewhere.

## 5. HTTPS

After DNS resolves and GitHub completes certificate provisioning, enable **Enforce HTTPS** in **Settings → Pages**.

DNS changes can take time to propagate. GitHub's DNS validation and HTTPS certificate provisioning may not be instantaneous.

## Before changing live DNS

Record the current DNS zone or take screenshots so it can be restored if needed. If the existing website must remain live until launch, publish and test the GitHub Pages URL first, then switch DNS only when ready.
