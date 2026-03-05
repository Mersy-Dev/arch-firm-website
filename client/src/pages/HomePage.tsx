import { Helmet } from 'react-helmet-async';
import HeroSection         from '@/components/sections/HeroSection';
import ProjectGrid         from '@/components/sections/ProjectGrid';
import ServicesList        from '@/components/sections/ServicesList';
import TestimonialCarousel from '@/components/sections/TestimonialCarousel';
import CTABanner           from '@/components/sections/CTABanner';
import { useGetProjectsQuery } from '@/services/projectsApi';

export default function HomePage() {
  const { data: featured, isLoading } = useGetProjectsQuery({ 
    featured: true, 
    published: true, 
    limit: 8
    , 
  });

  return (
    <>
      <Helmet>
        <title>Architecture Firm — Designing Spaces That Inspire</title>
        <meta name="description" content="Award-winning architecture firm." />
      </Helmet>
      <HeroSection />
      <ProjectGrid projects={featured?.data.projects ?? []} isLoading={isLoading} showFilters={false} />
      <ServicesList />
      <TestimonialCarousel />
      <CTABanner headline="Have a project in mind?" ctaLink="/contact" />
    </>
  );
}