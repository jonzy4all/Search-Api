import {
  ArrowLeft,
  Calendar,
  Heart,
  MapPin,
  Star,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import api from "../api/api";

import Loader from "../components/Loader";

import { useAuth } from "../context/AuthContext";

export default function RecordPage() {
  const { identifier } =
    useParams();

  const [record, setRecord] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const { user } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    const loadRecord = async () => {
      try {
        const response =
          await api.get(
            `/records/${identifier}`
          );

        setRecord(
          response.data.data
        );
      } catch (err) {
        setError(
          err.response?.data
            ?.message ||
            "Record could not be loaded."
        );
      } finally {
        setLoading(false);
      }
    };

    loadRecord();
  }, [identifier]);

  const saveFavorite = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const response =
        await api.post(
          `/favorites/${record.slug}`
        );

      window.alert(
        response.data.message
      );
    } catch (err) {
      window.alert(
        err.response?.data
          ?.message ||
          "Unable to save favorite."
      );
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="container page-section">
        <div className="alert error">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container page-section">
      <Link
        to="/"
        className="back-link"
      >
        <ArrowLeft size={16} />
        Back to search
      </Link>

      <article className="record-detail">
        <div className="record-detail-header">
          <div>
            <span className="category-badge">
              {record.category}
            </span>

            <h1>
              {record.title}
            </h1>
          </div>

          <button
            className="button primary"
            onClick={saveFavorite}
          >
            <Heart size={18} />
            Save record
          </button>
        </div>

        <div className="detail-metadata">
          <span>
            <Star
              size={17}
              fill="currentColor"
            />
            {record.rating} / 5
          </span>

          <span>
            Price:{" "}
            {Number(
              record.price || 0
            ).toLocaleString()}
          </span>

          {record.location?.city && (
            <span>
              <MapPin size={17} />
              {record.location.city}

              {record.location
                .country &&
                `, ${record.location.country}`}
            </span>
          )}

          <span>
            <Calendar size={17} />

            {new Date(
              record.createdAt
            ).toLocaleDateString()}
          </span>
        </div>

        <div className="detail-section">
          <h3>Description</h3>

          <p>
            {record.description}
          </p>
        </div>

        <div className="detail-section">
          <h3>Tags</h3>

          <div className="tag-list">
            {record.tags?.map(
              (tag) => (
                <span key={tag}>
                  #{tag}
                </span>
              )
            )}
          </div>
        </div>
      </article>
    </div>
  );
}