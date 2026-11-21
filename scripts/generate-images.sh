#!/bin/bash
# Génère les visuels d'ambiance provisoires OCD (sans visage identifiable — ne remplace pas la photo officielle de Bovann)
set -e
cd /home/z/my-project
mkdir -p public/images

z-ai image -p "African entrepreneurship conference, speaker seen from behind on stage addressing audience, dramatic orange stage lighting, crowd silhouettes, cinematic photography, no visible faces, high quality, professional event photography" -o public/images/gen-conference.png -s 1344x768
echo "done conference"
z-ai image -p "Young African professionals networking meetup, two people shaking hands, warm golden tones, blurred faces, modern co-working space, candid photography, high quality" -o public/images/gen-meetup.png -s 1344x768
echo "done meetup"
z-ai image -p "Collaborative workshop table overhead view, laptops notebooks and hands of African entrepreneurs working together, warm natural light, orange accents, candid photography, high quality" -o public/images/gen-workshop.png -s 1344x768
echo "done workshop"
z-ai image -p "African city street at golden hour, energetic movement of people walking, warm sunlight, shallow depth of field, cinematic urban photography, high quality" -o public/images/gen-city.png -s 1024x1024
echo "done city"
z-ai image -p "Empty dark studio backdrop with soft orange rim light and spotlight on empty podium microphone stand, editorial atmosphere, cinematic, no people, high quality" -o public/images/gen-stage-portrait.png -s 864x1152
echo "done stage-portrait"
z-ai image -p "Young entrepreneur working on laptop in a bright African cafe, shot from over the shoulder, face not visible, warm tones, documentary style photography, high quality" -o public/images/gen-entrepreneur.png -s 1344x768
echo "done entrepreneur"
echo "ALL DONE"
