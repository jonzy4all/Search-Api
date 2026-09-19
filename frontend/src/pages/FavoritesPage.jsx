import {
  Heart,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import api from "../api/api";

import Loader from "../components/Loader";
import RecordCard from "../components/RecordCard";
import Pagination from "../components/Pagination";

export default function FavoritesPage() {
  const [favorites, setFavorites] =
    useState([]);

  const [pagination, setPagination] =
    useState(null);

  const [page, setPage] =
    useState(1);

  const [loading, setLoading] =
    useState(true);

  const loadFavorites =
    async () => {
      setLoading(true);

      try {
        const response =
          await api.get(
            "/favorites",
            {
              params: {
                page,
                limit: 9,
              },
            }
          );

        setFavorites(
          response.data.data || []
        );

        setPagination(
          response.data.meta
            ?.pagination
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadFavorites();
  }, [page]);

  const removeFavorite = async (
    record
  ) => {
    try {
      await api.delete(
        `/favorites/${record.slug}`
      );

      await loadFavorites();
    } catch (err) {
      window.alert(
        err.response?.data
          ?.message ||
          "Unable to remove favorite."
      );
    }
  };

  return (
    <div className="container page-section">
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            YOUR COLLECTION
          </span>

          <h1>
            Saved favorites
          </h1>

          <p>
            Records you've saved for
            quick access.
          </p>
        </div>

        <Heart size={32} />
      </div>

      {loading ? (
        <Loader />
      ) : favorites.length === 0 ? (
        <div className="empty-state">
          <Heart size={35} />

          <h3>
            No favorites yet
          </h3>

          <p>
            Browse records and save the
            ones you like.
          </p>
        </div>
      ) : (
        <>
          <div className="record-grid">
            {favorites.map(
              (favorite) => (
                <RecordCard
                  key={
                    favorite.favoriteId
                  }
                  record={
                    favorite.record
                  }
                  saved
                  onRemove={
                    removeFavorite
                  }
                />
              )
            )}
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