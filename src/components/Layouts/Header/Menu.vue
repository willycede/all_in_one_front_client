<template>
   <div class="navbar onsus-nav-menu">
      <ul class="app-nav-list pl-0">
         <li class="app-nav-item" v-for="(menuItem , key) in menus" :key="key">
				<router-link :to="menuItem.path">{{ $t(menuItem.name) }}</router-link>
				<template v-if="menuItem.type === 'sub_menu'">
					<ul class="sub-menu" v-if="menuItem.children && menuItem.children.length > 0">
						<li v-for="(subMenuItem , subMenuKey) in menuItem.children" :key="subMenuKey">
							<router-link :to="subMenuItem.path">{{ $t(subMenuItem.name) }}</router-link>
							<ul
								v-if="subMenuItem.children && subMenuItem.children.length > 0"
								class="sub-menu"
							>
								<li v-for="(childItem, childKey) in subMenuItem.children" :key="childKey">
									<router-link :to="childItem.path">{{ $t(childItem.name) }}</router-link>
								</li>
							</ul>
						</li>
					</ul>
				</template>
				<template v-if="menuItem.type === 'mega_menu'">
					<ul class="sub-menu mega">
						<li v-for="(megaitem,megaitemkey) in menuItem.children" :key="megaitemkey">
							<a>{{ $t(megaitemkey) }}</a>
							<ul class="sub-menu">
								<li v-for="(submega,submegakey) in megaitem" :key="submegakey">
									<router-link :to="submega.path">{{ $t(submega.name) }}</router-link>
								</li>
							</ul>
						</li>
					</ul>
				</template>
         </li>
      </ul>
   </div>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
   computed:{
		...mapGetters(["menus"]),
	},
}
</script>
