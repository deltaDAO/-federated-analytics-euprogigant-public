import { Container, createStyles, Grid, Text } from '@mantine/core';
import Image from 'next/image';

const useStyles = createStyles((theme) => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: theme.spacing.xl * 3,
    maxWidth: '1680px',
  },

  logoContainer: {
    width: '100%',
  },

  logo: {
    alignSelf: 'center',
  },
}));

const fundedByList = [
  { name: 'BMK Logo', src: '/assets/fundedBy/1-BMK_Logo_EN.jpg' },
  { name: 'BMWE Logo', src: '/assets/fundedBy/2-BMWE_Fz_2017_Office_Farbe_en.png' },
  { name: 'FFG Logo', src: '/assets/fundedBy/3-FFG_Logo_DE_RGB_1500px.png' },
  { name: 'DLR Logo', src: '/assets/fundedBy/4-PT_DLR_Logo_GR_D_2018_lang.jpg' },
];

export const FundedBy = () => {
  const { classes } = useStyles();

  return (
    <Container className={classes.wrapper}>
      <Text size="md">Funded by</Text>
      <Grid className={classes.logoContainer} px={0} gutter={'sm'} justify={'start'}>
        {fundedByList.map((image) => (
          <Grid.Col key={image.name} md={3} sm={4} xs={5}>
            <Image
              className={classes.logo}
              src={image.src}
              height={150}
              width={200}
              objectFit="contain"
              alt={image.name}
            />
          </Grid.Col>
        ))}
      </Grid>
    </Container>
  );
};
