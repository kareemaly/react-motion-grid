react-motion-grid
---------------

Installing
------------
```
$ npm install react-motion-grid --save
```

[Demos](http://bitriddler.com/playground/motion-grid)
--------------




| Property | Type | Default | Description |
| --- | --- | --- | --- |
| disableAnimation | bool |  |  |
| columns | union | 12 |  |
| innerPadding | union | 0 |  |
| startAnimate | bool | true |  |
| enablePaging | bool | false |  |
| pagingOptions | shape (isFetchedAll, isLoading, loadMoreItems) | {} |  |
| children* | arrayOf (element) |  |  |
| springOptions | shape (stiffness, damping) | presets.noWobble |  |
| shellItemsRows | number | 3 |  |
| animationType | enum | 'fadeIn' |  |
| enableAppShell | bool | false |  |
| appShellItem | element |  |  |
| minimumAppShellTime | number | 0 |  |

Contributing
--------------
To contribute, follow these steps:
- Fork this repo.
- Clone your fork.
- Run `npm install`
- Run `npm start`
- Goto `localhost:3000`
- Add your patch then push to your fork and submit a pull request

License
---------
MIT
