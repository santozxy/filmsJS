import { StyleSheet } from "react-native";
import { useEffect, useState } from "react";

import {
  Container,
  Header,
  HeaderButton,
  BannerContainer,
  Banner,
  ButtonLink,
  Title,
  RatedContainer,
  Rate,
  Votes,
  ListGenres,
  Description,
  SliderMovie
} from "./styles";

import { ScrollView, Modal } from "react-native";

import { Feather, Ionicons } from "@expo/vector-icons";

import {
  useNavigation,
  useRoute,
  useIsFocused,
} from "@react-navigation/native";

import api, { key } from "../../services/api";
import Genres from "../../components/Genres";
import ModalLink from "../../components/ModalLink";
import { getListMovies } from "../../utils/movie";
import SliderItem from "../../components/SliderItem";

function Details() {
  const navigation = useNavigation();

  const route = useRoute();

  const [movie, setMovie] = useState({});

  const [similars, setSimilars] = useState({});

  const [openLink, setOpenLink] = useState(false);

  useEffect(() => {
    let isActive = true;
    const ac = new AbortController();

    async function getMovie() { //Requisição dos detalhes do filme à partir do ID
      const [movieDetail, movieSimilar] = await Promise.all([
        api.get(`/movie/${route.params?.id}`, {
          params: {
            api_key: key,
            language: "pt-BR",
          }
        }),
        api.get(`/movie/${route.params?.id}/similar`, {
          params: {
            api_key: key,
            language: "pt-BR",
            page: 1,
          }
        }),
      ])
      if (isActive) {
        setMovie(movieDetail.data)
        setSimilars(getListMovies(8, movieSimilar.data.results))
      }

    }
    getMovie();

    return () => {
      isActive = false;
      ac.abort;
    };
  }, [route]);

  function navigateDetails(item) {
    navigation.navigate('Details', { id: item.id })
  }


  return (
    <Container>
      <Header>
        <HeaderButton onPress={() => navigation.goBack()}>
          <Feather
            name="arrow-left"
            size={28}
            color="#fff"
          />
        </HeaderButton>
        <HeaderButton>
          <Ionicons
            name="bookmark"
            size={28}
            color="#fff"
          />
        </HeaderButton>
      </Header>
      <BannerContainer>
        <Banner
          source={{ uri: `https://image.tmdb.org/t/p/original/${movie.backdrop_path}`, }}
          resizeMethod="resize"
        />
        <ButtonLink onPress={() => setOpenLink(true)}>
          <Feather
            name="link"
            size={28}
            color="#fff"
          />
        </ButtonLink>
      </BannerContainer>

      <Title numberOfLines={1}>{movie.title}</Title>
      <RatedContainer>
        <Rate> <Ionicons name='md-star' size={22} color="#e7a74e" />{movie.vote_average?.toFixed(1)}/10</Rate>
        <Votes><Ionicons name='person' size={22} color="#e7a74e" />{movie.vote_count}</Votes>
      </RatedContainer>
      <ListGenres
        data={movie?.genres}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <Genres data={item} />}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Title>
          Descrição
        </Title>
        <Description>{movie.overview}</Description>
        <Title>
          Filmes parecidos
        </Title>
        <SliderMovie
          horizontal
          showsHorizontalScrollIndicator={false}
          data={similars}
          renderItem={({ item }) => <SliderItem data={item} navigateDetails={() => navigateDetails(item)} />}
          keyExtractor={(item) => String(item.id)}
        />
      </ScrollView>
      <Modal animationType="slide" transparent visible={openLink}>
        <ModalLink link={movie.homepage} title={movie?.title} closeModal={() => setOpenLink(false)} />
      </Modal>
    </Container>
  );
}

export default Details;

const styles = StyleSheet.create({});
