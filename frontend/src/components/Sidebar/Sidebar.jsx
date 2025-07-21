import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import "./Sidebar.scss";

const Sidebar = ({ open, onClose, score, suggestions, loading }) => {
  return (
    <Dialog.Root open={open} modal={true} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="sidebar-overlay" />

        {/* ✅ Use `asChild` to apply transitionable class */}
        <Dialog.Content asChild>
          <div className="sidebar-content">
            <Dialog.Title asChild>
              <VisuallyHidden>Blog Quality Sidebar</VisuallyHidden>
            </Dialog.Title>
            <button className="sidebar-close" onClick={() => onClose(false)}>
              &raquo;&raquo;
            </button>
            <div className="sidebar-inner">
              {loading ? (
                <div className="skeleton-container">
                  <div className="skeleton-title" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line" />
                </div>
              ) : (
                <>
                  <div className="score-box">
                    <h2>Blog Score</h2>
                    <div className="score-value">{score}/100</div>
                  </div>

                  <div className="suggestions-section">
                    <h3>Suggestions</h3>
                    <ul className="suggestion-list">
                      {suggestions?.slice(0, 3).map((s, i) => (
                        <li key={i} className="suggestion-card">
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default Sidebar;
