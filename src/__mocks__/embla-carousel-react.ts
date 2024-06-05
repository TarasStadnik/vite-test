const useEmblaCarousel = jest.fn().mockReturnValue([
  jest.fn(),
  {
    canScrollPrev: jest.fn().mockReturnValue(false),
    canScrollNext: jest.fn().mockReturnValue(false),
    scrollPrev: jest.fn(),
    scrollNext: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
  },
]);

export default useEmblaCarousel;
