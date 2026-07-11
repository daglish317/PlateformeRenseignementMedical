import Container from "@/components/layout/container/container";
import Page from "@/components/layout/page/Page";
import Section from "@/components/layout/section/Section";

export default function HomePage() {
  return (
    <Page>
      <Section spacing="xl">
        <Container className="text-center">
          <h1 className="text-5xl font-bold">
            SantéProx
          </h1>

          <p className="mt-6 text-lg text-muted-foreground">
            Première version de l'interface publique.
          </p>
        </Container>
      </Section>
    </Page>
  );
}