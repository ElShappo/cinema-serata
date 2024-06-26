import { useEffect, useMemo, useState } from "react";
import { api } from "../../../api";
import { Movie, MovieUniversalSearchResponse } from "../../../types";
import {
  defaultPagesCount,
  maxYear,
  minYear,
  pageLimit,
} from "../../../constants";
import ratingSlider from "../../../store/ratingSlider";
import genres from "../../../store/genres";
import dateRange from "../../../store/dateRange";
import { Pagination } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import CardSkeleton from "../../../components/CardSkeleton/CardSkeleton";
import { Store } from "react-notifications-component";
import { observer } from "mobx-react-lite";
import MovieCard from "../../../components/Movie/MovieCard/MovieCard";
import NoResults from "../../../components/NoResults/NoResults";

const Movies = observer(() => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [movies, setMovies] = useState<Movie[] | undefined>([]);
  const [pagesCount, setPagesCount] = useState(defaultPagesCount);
  const [isMoviesLoading, setIsMoviesLoading] = useState(false);

  const pageNo = useMemo(
    () => +(searchParams.get("pageNo") || 1),
    [searchParams]
  );

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    const urlSearchParams = new URLSearchParams(searchParams);
    urlSearchParams.set("pageNo", value.toString());
    setSearchParams(urlSearchParams);
    console.log(pageNo);
  };

  useEffect(() => {
    async function fetchMovies() {
      setIsMoviesLoading(true);
      try {
        const years = dateRange.getAll().length
          ? dateRange.getAll()
          : [
              searchParams.get("start_year") || minYear,
              searchParams.get("end_year") || maxYear,
            ];

        const rating = ratingSlider.getAll().length
          ? ratingSlider.getAll()
          : [
              searchParams.get("min_rating") || 0,
              searchParams.get("max_rating") || 10,
            ];

        const chosenGenres = genres.getChosenGenres().length
          ? genres.chosenGenres
          : searchParams.getAll("genre");

        // console.log(years);
        // console.log(rating);
        // console.log(chosenGenres);

        const response = (await api.getMovies({
          limit: pageLimit,
          page: pageNo,
          years: years.map((year) => +year) as [number, number],
          rating: rating.map((r) => +r),
          genres: chosenGenres,
        })) as MovieUniversalSearchResponse;

        const movies = response.docs;

        // console.warn("Got movies: ");
        // console.warn(movies);

        setMovies(movies);
        setIsMoviesLoading(false);

        setPagesCount(response.pages);
      } catch (error) {
        setIsMoviesLoading(false);
        Store.addNotification({
          title: (
            <article className="flex items-center gap-4">
              <span className="text-base">
                Не удалось загрузить список фильмов
              </span>
            </article>
          ),
          type: "danger",
          insert: "top",
          container: "top-right",
          animationIn: ["animate__animated", "animate__fadeIn"],
          animationOut: ["animate__animated", "animate__fadeOut"],
          dismiss: {
            duration: 5000,
            onScreen: true,
          },
        });
      }
    }
    fetchMovies();
    // console.log(ratingSlider.getAll());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNo, genres.chosenGenres, dateRange.range, ratingSlider.rating]);

  if (isMoviesLoading) {
    return (
      <section className="flex flex-wrap gap-8 justify-center overflow-y-auto p-8">
        {new Array(pageLimit).fill(1).map((_value, index) => (
          <CardSkeleton key={index} />
        ))}
      </section>
    );
  } else if (!movies?.length) {
    return <NoResults />;
  } else {
    return (
      <>
        <main>
          <section className="flex flex-wrap gap-8 justify-center overflow-y-auto p-8">
            {movies!.map((movie) => (
              <MovieCard movie={movie} key={movie.id} />
            ))}
          </section>
        </main>
        <footer className="w-full fixed flex justify-center bottom-0 bg-[#242424] bg-opacity-80 py-4">
          <Pagination
            count={pagesCount}
            page={pageNo}
            onChange={handlePageChange}
          />
        </footer>
      </>
    );
  }
});

export default Movies;
