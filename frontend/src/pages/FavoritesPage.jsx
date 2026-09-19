import { Heart } from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import api from "../api/api";
import Loader from "../components/Loader";
import Pagination from "../components/Pagination";
import RecordCard from "../components/RecordCard";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFavorites = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/favorites", {
        params: {
          page,
          limit: 9,
        },
      });

      setFavorites(response.data.data || []);
      setPagination(response.data.meta?.pagination || null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load favorites."
      );
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const removeFavorite = async (record) => {
    try {
      await api.delete(`/favorites/${record.slug}`);

      if (favorites.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await loadFavorites();
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to remove favorite."
      );
    }
  };

  return (
    <div className="container page-section">
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR COLLECTION</span>
          <h1>Saved favorites</h1>
          <p>Records you've saved for quick access.</p>
        </div>

        <Heart size={32} />
      </div>

      {error && <div className="alert error">{error}</div>}

      {loading ? (
        <Loader />
      ) : favorites.length === 0 ? (
        <div className="empty-state">
          <Heart size={35} />
          <h3>No favorites yet</h3>
          <p>Browse records and save the ones you like.</p>
        </div>
      ) : (
        <>
          <div className="record-grid">
            {favorites.map((favorite) => (
              <RecordCard
                key={favorite.favoriteId}
                record={favorite.record}
                saved
                onRemove={removeFavorite}
              />
            ))}
          </div>

          <Pagination
            pagination={pagination}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
