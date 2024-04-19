import React, { FC, ReactNode } from 'react'
import Markdown from 'react-markdown'

import { replaceImageResolution } from '../../common/utils'
import { Eyebrow } from '../Eyebrow'

interface CollectionHeaderProps {
  eyebrow: string
  children: ReactNode
  coverImage: string
  name: string
  description: string
}

export const CollectionHeader: FC<CollectionHeaderProps> = ({ children, eyebrow, coverImage, name, description }) => (
  <>
    <div className="flex relative flex-col lg:flex-row-reverse lg:min-h-screen lg:h-min items-stretch collection-header">
      <div
        className="w-full lg:w-1/2 bg-no-repeat bg-center bg-cover h-96 lg:h-auto"
        style={{ backgroundImage: `url(${replaceImageResolution(2000)(coverImage)})` }}
      ></div>
      <div className="w-full lg:w-1/2 p-16 max-w-3xl">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="text-[2rem] md:text-[4rem] lg:text-[5rem] leading-none font-bold mb-4 tracking-tight boska break-words">
          {name}
        </h2>
        <div className="my-8 satoshi text-sm lg:text-lg leading-relaxed">
          <Markdown>{description}</Markdown>
        </div>
        {children}
      </div>
    </div>
  </>
)
