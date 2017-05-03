react-motion-grid
---------------

Installing
------------
```
$ npm install react-motion-grid --save
```

[Demos](http://bitriddler.com/playground/motion-grid)
--------------

Usage
------------
```javascript
<MotionGrid
  columns={[
    6, 6
    4, 4, 4
    3, 3, 3, 3
    6, 6,
  ]}
  innerPadding={{
    vertical: 10,
    horizontal: 10,
  }}
>
  {range(20).map(renderItem)}
</MotionGrid>
```

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| children* | arrayOf (element) |  | Array of react elements you want to render in a grid. |
| columns | union (<br />number,<br />arrayOf (number)<br />) | 12 | This controls number of columns to render for each row.<br />This **MUST** be between 1 and 12<br />e.g. `12 / 3` -> This will render 3 columns in each row.<br />e.g. `[ 6, 6, 4, 4, 4 ]` -> This will render 5 items in two rows, first <br />row will render two items (6, 6), second row will render three items<br />(4, 4, 4). |
| innerPadding | union (<br />number,<br />string,<br />shape {<br />`vertical: union`<br />`horizontal: union`<br />}<br />) | 0 | Inner paddings between items. You can have different vertical and horizontal<br />paddings. |
| startAnimate | bool | true | If you want to control when the animation should start then set this to<br />false. |
| animationType | enum ('bottomFadeIn', 'fadeIn') | 'fadeIn' | Animation type to use. |
| disableAnimation | bool |  | This will disable the animation. |
| enablePaging | bool | false | Enable paging feature. |
| pagingOptions | shape {<br />`isFetchedAll: bool`<br />`isLoading: bool`<br />`loadMoreItems: func`<br />} | {} | This is only considered when enablePaging is true. |
| springOptions | shape {<br />`stiffness: number`<br />`damping: number`<br />} | presets.noWobble | React motion configurations.<br />[More about this here](https://github.com/chenglou/react-motion#--spring-val-number-config-springhelperconfig--opaqueconfig) |
| enablePlaceholders | bool | false | Whether or not to enable placeholders. |
| placeholderRows | number | 3 | Number of placeholder rows to show before data is loaded |
| placeholderItem | element |  | React element to render for the placeholder |
| minimumPlaceholdersTime | number | 0 | Minimum millis to wait before hiding placeholder even if the data was loaded.<br />This is used to pervent flickers when the data is loaded in a very short time |

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
