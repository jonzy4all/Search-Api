import {
  ArrowUpRight,
  Heart,
  MapPin,
  Star,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

export default function RecordCard({
  record,
  onSave,
  onRemove,
  saved = false,
}) {
  return (
    <article className="record-card">
      <div className="record-card-top">
        <span className="category-badge">
          {record.category}
        </span>

        <div className="rating">
          <Star
            size={16}
            fill="currentColor"
          />

          {record.rating}
        </div>
      </div>

      <h3>{record.title}</h3>

      <p className="record-description">
        {record.description}
      </p>

      {record.tags?.length > 0 && (
        <div className="tag-list">
          {record.tags
            .slice(0, 4)
            .map((tag) => (
              <span key={tag}>
                #{tag}
              </span>
            ))}
        </div>
      )}

      <div className="record-info">
        <span>
          Price:{" "}
          <strong>
            {Number(
              record.price || 0
            ).toLocaleString()}
          </strong>
        </span>

        {record.location?.city && (
          <span>
            <MapPin size={15} />

            {record.location.city}

            {record.location.country
              ? `, ${record.location.country}`
              : ""}
          </span>
        )}
      </div>

      <div className="record-actions">
        <Link
          to={`/records/${record.slug}`}
          className="button secondary"
        >
          View details
          <ArrowUpRight size={16} />
        </Link>

        {saved && onRemove ? (
          <button
            className="icon-button danger"
            onClick={() =>
              onRemove(record)
            }
            title="Remove favorite"
          >
            <Heart
              size={18}
              fill="currentColor"
            />
          </button>
        ) : onSave ? (
          <button
            className="icon-button"
            onClick={() =>
              onSave(record)
            }
            title="Save favorite"
          >
            <Heart size={18} />
          </button>
        ) : null}
      </div>
    </article>
  );
}