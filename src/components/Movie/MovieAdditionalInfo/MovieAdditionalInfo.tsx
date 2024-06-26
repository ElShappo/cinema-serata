import { Movie } from "../../../types";
import { capitalizeFirstLetter } from "../../../utils";
import NoResults from "../../NoResults/NoResults";

type MovieDescriptionProps = {
  genres?: Movie["genres"];
  year?: Movie["year"];
  isLoading: boolean;
};

const MovieAdditionalInfo = ({
  genres,
  isLoading,
  year,
}: MovieDescriptionProps) => {
  return (
    <article className="flex flex-col gap-5 w-1/2 max-xl:w-full rounded-2xl p-4 px-8 bg-gray-800 bg-opacity-60 text-white">
      <div>
        <h2>Жанр фильма</h2>
        {isLoading ? (
          <div>Загружаю описание...</div>
        ) : !genres || !genres.length ? (
          <NoResults text="Описание жанра фильма отсутствует" />
        ) : (
          <p
            className="pt-2"
            dangerouslySetInnerHTML={{
              __html: capitalizeFirstLetter(
                genres.map((genre) => genre.name).join(", ")
              ),
            }}
          ></p>
        )}
      </div>
      <div>
        <h2>Дата выхода</h2>
        {isLoading ? (
          <div>Загружаю описание...</div>
        ) : !year ? (
          <NoResults text="Год выхода фильма отсутствует" />
        ) : (
          <p
            className="pt-2"
            dangerouslySetInnerHTML={{
              __html: year,
            }}
          ></p>
        )}
      </div>
    </article>
  );
};

export default MovieAdditionalInfo;
