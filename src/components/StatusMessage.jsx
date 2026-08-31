/** Renders the success/error banner used by every page. Renders nothing when there is no feedback. */
export default function StatusMessage({ feedback, onDismiss }) {
  if (!feedback) {
    return null;
  }
  return (
    <div className={`status-message status-message-${feedback.type}`} role="status">
      <span>{feedback.text}</span>
      {onDismiss && (
        <button type="button" className="status-message-close" onClick={onDismiss}>
          Dismiss
        </button>
      )}
    </div>
  );
}
