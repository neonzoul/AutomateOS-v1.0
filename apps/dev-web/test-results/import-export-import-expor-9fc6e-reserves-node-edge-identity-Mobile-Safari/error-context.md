# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - application [ref=e5]:
      - generic [ref=e9]:
        - button "+ Start" [ref=e10]
        - button "+ HTTP" [ref=e11]
        - generic [ref=e13] [cursor=pointer]: Import
        - button "Export" [ref=e14]
        - button "Clear" [ref=e16]
      - img
      - generic "Control Panel" [ref=e17]:
        - button "Zoom In" [ref=e18] [cursor=pointer]:
          - img [ref=e19] [cursor=pointer]
        - button "Zoom Out" [ref=e21] [cursor=pointer]:
          - img [ref=e22] [cursor=pointer]
        - button "Fit View" [ref=e24] [cursor=pointer]:
          - img [ref=e25] [cursor=pointer]
        - button "Toggle Interactivity" [ref=e27] [cursor=pointer]:
          - img [ref=e28] [cursor=pointer]
      - img "Mini Map" [ref=e31]
    - generic [ref=e33]:
      - generic [ref=e35]: Select a node to configure its properties
      - complementary "Run Panel" [ref=e36]:
        - generic [ref=e37]:
          - heading "Run" [level=3] [ref=e38]
          - button "Run" [disabled] [ref=e39]
        - generic [ref=e40]: Add nodes to run workflow
        - generic [ref=e41]: No runs yet
  - button "Open Next.js Dev Tools" [ref=e47] [cursor=pointer]:
    - img [ref=e48] [cursor=pointer]
  - alert [ref=e53]
```