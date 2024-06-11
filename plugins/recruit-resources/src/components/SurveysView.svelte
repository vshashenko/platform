<script lang="ts">
  import surveys from '@hcengineering/surveys'
  import tags from '@hcengineering/tags'
  import { Component } from '@hcengineering/ui'
  import recruit from '../plugin'
  console.log('surveys', surveys);
  console.log('tags', tags);
  
  
</script>
<Component
  is={surveys.component.SurveysView}
  props={{
    targetClass: recruit.mixin.Candidate,
    title: recruit.string.SurveyLabel,
    icon: recruit.icon.Surveys,
    item: recruit.string.SurveyLabel,
    key: 'surveys',
    сreateItemLabel: recruit.string.SurveyCreateLabel,
    onTag: () => {
      console.log('onTag');
    }
  }}
>
</Component>
