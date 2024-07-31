import { type Domain, IndexKind } from '@hcengineering/core'
import { type Builder, Index, Model, Prop, TypeString, UX } from '@hcengineering/model'
import core, { TDoc } from '@hcengineering/model-core'
import video, { videoId, type Video } from '@hcengineering/video'
import workbench from '@hcengineering/model-workbench'

export { default, videoId } from '@hcengineering/video'

export const DOMAIN_VIDEO = 'video' as Domain

@Model(video.class.Video, core.class.Doc, DOMAIN_VIDEO)
@UX(video.string.Video, video.icon.Video, video.icon.Video, 'VID', 'name', video.string.Video)
export class TVideo extends TDoc implements Video {
  @Prop(TypeString(), video.string.Name)
  @Index(IndexKind.FullText)
    name!: string

  @Prop(TypeString(), video.string.URL)
    url!: string
}

// export class TVideoSpace extends TSpace {}

export function createModel (builder: Builder): void {
  builder.createDoc(
    workbench.class.Application,
    core.space.Model,
    {
      alias: videoId,
      hidden: false,
      icon: video.icon.Video,
      label: video.string.Video,
      // locationResolver: video.resolver.Location,
      navHeaderComponent: video.component.NewRecordingButton,
      navigatorModel: {
        spaces: [],
        specials: [
          {
            component: workbench.component.SpecialView,
            id: 'videos',
            label: video.string.Video,
            icon: video.icon.Video
          }
        ]
      }
    },
    video.app.Videos
  )
}
