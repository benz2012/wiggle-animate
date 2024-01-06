import { observer } from 'mobx-react-lite'

const DraggingIndicators = observer(({ store }) => (
  <>
    {store.leftMenu.dragIndicatorY !== -1 && (
      <div
        className="left-menu-dragging-indicator"
        style={{ top: store.leftMenu.dragIndicatorY }}
      >
        <div className="left-menu-dragging-indicator-circle" />
      </div>
    )}
    <div
      // The skeleton is both a nice visual indicator, and it also blocks
      // hover interactions with the underlying list items which would have
      // made for a confusing UX mid-drag
      className="left-menu-dragging-skeleton"
      style={{
        height: `${store.leftMenu.itemHeight}px`,
        top: (store.build.pointerPosition.y / store.DPR) - (store.leftMenu.itemHeight / 2),
        left: (store.build.pointerPosition.x / store.DPR) - (store.leftMenu.dragStart.x) + 8,
      }}
    />
  </>
))

export default DraggingIndicators
