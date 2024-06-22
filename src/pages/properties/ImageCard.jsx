import { useMemo, useState } from "react";
import { useTheme } from "@mui/material";
import { tokens } from "src/theme";
import { Card, CardActionArea, CardContent, CardMedia } from "@mui/material";
import { asset } from "src/utils/Utils";
import ImagePreview from "src/components/Uploader/ImagePreview";

export default function PropertyImageCard({ property = {}, width = '120px', imageHeight = '80px', hideContent = false, previewImage = false, onClick }) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const images = useMemo(() =>
    (property?.images || []).map(t => {
      if (t.image_data) {
        return { url: asset(t.image_data, 'base64') }
      }
      if (t.image_url) {
        return { url: asset(t.image_url) }
      }
      return {url: ''}
    })
  , [property])

  const [previewImages, setPreviewImages] = useState([])
  const handleImagePreview = e => {
    if (previewImage) {
      setPreviewImages( images )
    }
  }

  return <>
    <Card onClick={ onClick || handleImagePreview } sx={{ width, maxWidth: 240, backgroundColor: colors.primary[400] }}
       title={ property.property_name }
      >
      <CardActionArea>
        <CardMedia
          component="img"
          sx={{ height: imageHeight }}
          image={ images[0]?.url }
          />
        { !hideContent && <CardContent sx={{padding: '4px' }}>
          <div title={property.property_name } style={{ overflowWrap: 'break-word', wordWrap: 'break-word', whiteSpace: 'normal', lineHeight: 1.2 }}>
            { property.property_name }
          </div>
        </CardContent>
        }
      </CardActionArea>
    </Card>
    { previewImages.length ? <ImagePreview files={previewImages} onClose={ e => setPreviewImages([]) } currentIndex={0}/> : '' }
  </>
}