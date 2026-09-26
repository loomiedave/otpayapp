export type Data = {
  id: number;
  image: any;
  title: string;
  text: string;
};

export const data: Data[] = [
  {
    id: 1,
    image: require('../assets/image1.png'),
    title: 'Lorem Ipsum',
    text: '...',
  },
  {
    id: 2,
    image: require('../assets/image2.png'),
    title: 'Lorem Ipsum',
    text: '...',
  },
  {
    id: 3,
    image: require('../assets/image3.png'),
    title: 'Lorem Ipsum',
    text: '...',
  },
];
