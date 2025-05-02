# Wiggle Animate

A vector-based motion graphics animation tool that enables rapid development with an intuitive user interface.

It is free and open-source, meant to enable creators with easy access to a powerful tool directly in their web browser.

![A screenshot of the web application](./docs/wiggle-cover.png)

---

## Development

Setup

```sh
npm install
```

Run

```sh
npm start
```

## Testing

Sometimes the UI end-to-end tests will fail even though there are no real issues with a particular branch/PR. This can occur when small changes bubble up through the Playwright rendering engines.

In this case, and generally, to regenerate the latest compare screenshots:

- run the [Update Screenshots](https://github.com/benz2012/wiggle-animate/actions/workflows/playwright-update.yml) GitHub Workflow
- download the artifact it generates
- commit those to the repo
