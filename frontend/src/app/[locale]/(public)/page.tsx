import Container from "@/components/layout/container/container";
import Page from "@/components/layout/page/Page";
import Section from "@/components/layout/section/Section";

import PublicHome from "@/components/home/PublicHome";


export default function HomePage() {
  return (
    <Page>

      <Section
        spacing="none"
        className="flex-1"
      >

        <Container
          fluid
          className="h-full"
        >

          <PublicHome />

        </Container>

      </Section>

    </Page>
  );
}